import { Asset, AudioClip, Color, Material, Node, ParticleSystem2D, Prefab, Size, SpriteFrame, Texture2D, Vec4, geometry, renderer } from "cc"
import { initData } from "../../../app/GameDefine"
import { Scene } from "../../../scene/script/Scene"
import { Vector2, EModuleType, BaseModuleEvent, _scene, _audio, TResoucesUrl, DataLogicHelper, _ui, JS, ColliderGroup, CreatePrefabToEditorCC, LayoutCC, _resouces, IVector2, P2World, P2Group, P2ShapeEditorCC, TVectorSet, StateMackine, Sets, Collider2DEditorCC, Rectangle, _config_, winSize, LevelHelper, moduleMgr, _gameType, _timer, Maths, _prop, _login, EUILayer, NodeHelper, _guide, winCenterPostion, IUIModule, _main, _logic, Polygon, _platform, MaxBoxCC, Circle, NodeHollow, EEntityState, _language, SkinHelper, Vector3, EPlatformType, EUIState, IVector3, RandomSeed, Times, TVector3Set, _logicCustom } from "../Main"
import { CBattleDirBack, CBattleDirV3, CBattleDirs, CBattleImgNames, CBattleShapeConfigColor, CBattleShapeConfigLevel, CBattleSizeEntityUrl, CBattleSizeEntityUrl1x1Shape, CBattleSizeEntityUrl1x1ShapeMatBlackImg, CBattleSizeEntityUrl1x1ShapeMatColor, CBattleSizeEntityUrl1x1ShapeMatWhiteImg, CBattleSizeTypeImgNames, CBattleToDayOnceSphere, CCubeSize, CCubeSizeAddV3, CSceneData, CXyzTemp, EBattleDirType, EBattleSizeType, EPropId, IBattleShapeMat, ILogicData, TBattleSizeWight } from "./define/LogicDefine"
import { EGameType, gameTypeModule } from "./define/GameTypeDefine"
import { LevelGameType } from "./gameType/LevelGameType"
import { TodayGameType } from "./gameType/TodayGameType"
import { RunUI } from "../../../scene/script/ui/RunUI"
import { ShapeGameType } from "./gameType/ShapeGameType"

const rayT = new geometry.Ray()
const v2T = new Vector2()
const v3T = new Vector3()
const v3T2 = new Vector3()
const randomTemp = [
    [0, 1, 2, 3],
    [0, 1, 4, 5],
    [2, 3, 4, 5],
    [4, 5, 6, 7],
]


@moduleMgr.add(EModuleType.logic)
export class LogicModule extends BaseModuleEvent {

    public readonly EventType = {
        USE_DIRBACK: "USE_DIRBACK",
        USE_DIRBACK_COMPLETE: "USE_DIRBACK_COMPLETE",
        DURATION_CHANGE: "DURATION_CHANGE",


        CHANGE_SKIN_COMPLETE: "CHANGE_SKIN_COMPLETE",
        PROP_CHANGE: "PROP_CHANGE",
        PLAY_ANIM: "PLAY_ANIM",
        TODAY_PROP_REWARD: "TODAY_PROP_REWARD",
        TODAY_SUCCESS: "TODAY_SUCCESS",
    }

    public data: DataLogicHelper<ILogicData> = null!

    public orginSize: Vector3 = new Vector3()
    public orginSizeSub: Vector3 = new Vector3()
    public size: Vector3 = new Vector3()
    public widget: TBattleSizeWight = null!

    public cubeSize = 0
    public offsetY = new Vector2()
    public scaleRatio = 0
    public offset = new Vector2()
    public animIndex: number = -1
    public sizeLen = -1
    public preLoadRes: TResoucesUrl<Asset>[] = []
    public _remove: boolean = false
    public _createData: () => void = null!
    public arrowSkin: SkinHelper = null!

    public get _level(): LevelGameType { return gameTypeModule.get(EGameType.level) }
    public get _today(): TodayGameType { return gameTypeModule.get(EGameType.today) }
    public get _shape(): ShapeGameType { return gameTypeModule.get(EGameType.shape) }
    private get scene() { return _scene.getCurrent<Scene>() }

    onCreate() {


        this.data = new DataLogicHelper<ILogicData>(
            () => ({
                type: EBattleSizeType["1*1"],
                positions: [],
                center: new Vector3(),
                indexCenter: new Vector3(),
                dir: EBattleDirType.back,
                entity: null!,
                customDownEntity: null!,
                customCube1x1Entity: null!,
                aabb: new geometry.AABB()
            }),
            (data) => {
                for (let v of data.positions)
                    Vector3.pool.put(v)
                data.positions.length = 0
                data.entity = null!
                data.customCube1x1Entity = null!
                data.customDownEntity = null!
            }
        )
        this.arrowSkin = _prop.createSkin(this.storage, "skin_item", 1)

        this.preLoadRes.push(
            { type: Prefab, url: _ui.DefaultUrl.moveUp },
            { type: AudioClip, url: CSceneData.audio.remove },
            { type: AudioClip, url: CSceneData.audio.magic },
            ...this.getSkinUrls(),
        )
        for (let key in CBattleSizeEntityUrl)
            this.preLoadRes.push({ type: Prefab, url: CBattleSizeEntityUrl[key as any as 0] })
    }

    onLogic() {
        let isOnce = false
        _scene.once(_scene.EventType.CHANG_SUCCESS, () => {
            _audio.playMusic(CSceneData.audio.bgm)

            _timer.once(this, () => {
                // _gameType.type = EGameType.index
                if (_gameType.type == EGameType.none)
                    if (_login.isNewUser && initData.newUseEnterGame)
                        _gameType.type = EGameType.today
                    else
                        _gameType.type = EGameType.index

                isOnce = true

                _gameType.run(_gameType.type)
            }, 2 / 60)
        })

        _ui.on(_ui.EventType.OPEN, (url: string) => {
            if (url == initData.uiUrl.index) {
                // 显示默认方块
                if (isOnce)
                    _gameType.run(EGameType.index)
            }
        })


        for (let config of _config_.arr.prop)
            _prop.setSinglesOpenUI(config.id, () => {
                _ui.open(CSceneData.uiUrl.PropGetUI, _prop.singles.get(config.id))
            })


        _prop.on(_prop.EventType.PROP_SUB, (id: number) => {
            switch (id) {
                case EPropId.remove:
                    this.randomRemoveCount()
                    break
                case EPropId.back:
                    this.back()
                    break
                case EPropId.reset:
                    this.resets()
                    break
                case EPropId.time:
                    this._today.addTime(2 * 60)
                    break
            }

        })


        _main.preLoadQueue
            .add(complete => _resouces.loadPrefab(_ui.DefaultUrl.fly, complete))
            .add(complete => _resouces.loadPrefab(_ui.DefaultUrl.flyItem, complete))
            .add(complete => _resouces.loadPrefab(CSceneData.uiUrl.SettingUI, complete))
            .add(complete => _resouces.loadPrefab(CSceneData.uiUrl.FailUI, complete))
            .add(complete => _resouces.loadPrefab(CSceneData.uiUrl.SuccessUI, complete))
            .add(complete => _resouces.loadPrefab(CSceneData.uiUrl.PropGetUI, complete))
            .add(complete => _resouces.loadPrefab(CSceneData.uiUrl.LevelSelectUI, complete))

        this.arrowSkin.on(SkinHelper.EventType.CHANGE, this.loadSkinTexture, this)
    }

    private resets() {
        let removeIndex: number[] = []
        for (let i = 0; i < this.data.datas.length; i++)
            if (!this.data.datas[i])
                removeIndex.push(i)
        this.create(this.orginSize, this.widget, this._remove, this._createData, {
            position: this.cameraPosition,
            dis: this.cameraDis,
            rotate: this.cameraRotate,
        })

        for (let index of removeIndex)
            this.data.remove(index)

        this.scene.create(true)
    }

    private loadSkinTexture() {
        _resouces.loadDir(this.getSkinUrls(), () => {
            console.log("皮肤图片加载完成")
            this.emit(this.EventType.CHANGE_SKIN_COMPLETE)
        })
    }

    /**获取前面得所有格子 */
    public getFronts(orginData: ILogicData, curData: ILogicData, datas: ILogicData[], index: number) {
        let _datas: ILogicData[] = []
        let curIndex = this.data.datas.indexOf(curData)

        let _index = index + 1
        for (let pos of curData.positions) {
            // 每个格子得位置
            Vector3.add(v3T, pos, curData.center)

            let _data = this.getFront(curIndex, orginData.dir, v3T)
            if (_data) {
                _data.frontIndex = _index
                if (orginData == curData) {
                    _datas.push(_data)
                }
                else {
                    // 排除中间间隔得
                    if (geometry.intersect.aabbWithAABB(curData.aabb, _data.aabb)) {
                        _datas.push(_data)
                    }
                }
            }
        }

        if (_datas.length == 0)
            return
        for (let v of _datas) {
            if (!Sets.has(datas, v)) {
                datas.push(v)
                this.getFronts(orginData, v, datas, _index)
            }
        }
    }

    public getFront(index: number, dir?: EBattleDirType, pos?: IVector3) {
        let data = this.data.datas[index]
        if (dir === undefined) {
            dir = data.dir
        }

        if (pos === undefined) {
            pos = data.aabb.center
        }

        this.getDirMul(rayT.d, dir, 1)
        Vector3.set(rayT.o, pos)
        return this.scene.rayByData(rayT, this.data.datas, index)
    }


    public toDayPropReward() {
        this.storage.set("toDayProp", "true")
        _prop.addProp(EPropId.back)
        _prop.addProp(EPropId.remove)
        _prop.addProp(EPropId.reset)
        this.emit(this.EventType.TODAY_PROP_REWARD)
    }

    public getDirMul(
        out: IVector3,
        dir: EBattleDirType,
        mul: number,
        /**反向 */
        back = false
    ) {
        if (back)
            dir = CBattleDirBack[dir]
        Vector3.set(out, CBattleDirV3[dir])
        Vector3.mul(out, out, mul)
    }

    public randomRemoveCount(count = 5) {
        let datas: ILogicData[] = []
        for (let v of this.data.datas) {
            if (v !== null!)
                datas.push(v)
        }
        Sets.shuffle(datas)
        if (datas.length < count) {
            _gameType.isRun = false
        }

        let max = Math.min(count, datas.length)
        for (let i = 0; i < max; i++) {
            datas[i].entity.randomRemove()
        }
    }


    public getCubeUrl(index: number) {
        if (_gameType.type == EGameType.shape) {
            return CBattleSizeEntityUrl1x1Shape
        }
        let data = this.data.datas[index]
        return CBattleSizeEntityUrl[data.type]
    }

    public updateRankingStorage() {
        // _platform.OpenDataContext.set([this.toDayAllCount, this.level.cur])
    }

    public dirBack(index: number) {
        let data = this.data.datas[index]
        data.dir = CBattleDirBack[data.dir]

        data.entity.dirBack()
    }


    public back() {
        // 翻转所有
        let i = -1
        for (let data of this.data.datas) {
            i++
            if (data)
                this.dirBack(i)
        }
    }



    public getSkinUrls(obj: string[] = CBattleImgNames) {
        let res: TResoucesUrl<Texture2D>[] = []
        let url = _config_.obj.skin_item[this.arrowSkin.cur].scene_url
        for (let v of obj)
            res.push({ type: Texture2D, url: this.converSkinUrl(url, v) })
        return res
    }

    public converSkinUrl(url: string, name: string) {
        return url + "/" + name + "/texture"
    }

    public cameraPosition = new Vector3(16, 13, 16)
    public cameraDis = new Vector2(4)
    public cameraRotate = new Vector3(0)
    /**
     * 
     * @param size 2乘当前数值
     * @param widget 
     */
    public create(
        size: TVector3Set,
        widget: TBattleSizeWight,
        _remove: boolean,
        createData?: () => void,
        camera?: { position: Vector3, dis: Vector2, rotate?: Vector3, }
    ) {
        this._createClearDatas()

        this._remove = _remove
        this.widget = widget
        this.orginSize.set(size)
        this._createData = createData!

        if (!camera) {
            let minRatio = 3

            let y = this.orginSize.y

            this.cameraPosition.y = 7 + (y / 2 - 1) * minRatio
            this.cameraPosition.x = this.cameraPosition.y * 1.2
            this.cameraPosition.z = this.cameraPosition.y * 1.2

            this.cameraDis.x = 4
            this.cameraDis.y = this.cameraPosition.y * 2

            this.cameraRotate.set()
        }
        else {
            this.cameraPosition.set(camera.position)
            this.cameraDis.set(camera.dis)
            this.cameraRotate.set(camera.rotate)
        }


        if (createData)
            createData()
        else
            this._createBy2x2()


        this.addAabbRange(this.data.datas)
    }

    public _createClearDatas() {

        for (let v of _logicCustom.data.all)
            if (v)
                this.data.pool.put(v)
        _logicCustom.data.all.length = 0
        _logicCustom.data.datas.length = 0
        _logicCustom.data.downs.length = 0

        this.data.reset()
    }

    public addAabbRange(datas: ILogicData[]) {

        // 增大一圈 避免射线检测不到
        for (let data of datas)
            if (data) {
                data.aabb.halfExtents.add(CCubeSizeAddV3)
            }
    }


    private _createBy2x2() {
        // 转换为 2*2*2格式
        this.size.set(
            Math.ceil(this.orginSize.x / 2),
            Math.ceil(this.orginSize.y / 2),
            Math.ceil(this.orginSize.z / 2),
        )
        Vector3.mul(this.orginSizeSub, this.orginSize, .5)

        let remove: ("x" | "y" | "z")[] = []
        for (let v of CXyzTemp) {
            let _v = v as "x"
            if (this.orginSize[_v] % 2 == 1) {
                remove.push(_v)
                this.orginSizeSub[_v] = (this.orginSize[_v] + 2) / 2
            }
            else {
                this.orginSizeSub[_v] = this.orginSize[_v] / 2
            }
        }


        let all2x2 = this.size.x * this.size.y * this.size.z
        let allTypes = this._createWidget(this.widget, all2x2 * (2 * 2 * 2))

        // 平均分配到 2x2随机格子中
        let sizeDots = this._createSizeDots(all2x2, allTypes)
        Sets.shuffle(sizeDots, true, () => _gameType.curRandom.run())

        let logic2x2 = this._createLogic2x2(sizeDots)
        this._createDatas(logic2x2)
        if (this._remove)
            // 删减奇数格子的
            for (let v of remove)
                this._createRemove(v)
    }



    private _createRemove(type: "x" | "y" | "z") {
        let typeDatas: number[][] = []
        let i = -1
        for (let data of this.data.datas) {
            i++
            if (!data)
                continue
            for (let position of data.positions) {
                let num = data.indexCenter[type] + position[type]
                if (!typeDatas[num])
                    typeDatas[num] = []
                Sets.add(typeDatas[num], i)
            }
        }
        // 旁边的修剪 
        if (typeDatas[1])
            for (let i of typeDatas[1]) {
                let data = this.data.datas[i]
                if (!data)
                    continue
                // 都改为 1x1 放进格子里面
                if (data.type != EBattleSizeType["1*1"]) {
                    let isAdd = false
                    for (let pos of data.positions) {
                        if (Vector3.add(v3T, data.indexCenter, pos)[type] == 0)
                            continue
                        this.data.datas.push(this.create1x1(pos, data.center, data.indexCenter))
                        isAdd = true
                    }
                    if (isAdd)
                        this.data.remove(i)
                }
            }


        // 移除
        if (typeDatas[0])
            for (let i of typeDatas[0])
                this.data.remove(i)
    }

    public create1x1(pos: Vector3, centerAdd?: Vector3, indexCenter?: Vector3, dir?: EBattleDirType) {
        if (!centerAdd)
            centerAdd = Vector3.ZERO
        if (!indexCenter)
            indexCenter = Vector3.ZERO

        let v = this.data.pool.get()
        v.type = EBattleSizeType["1*1"]
        v.positions.push(Vector3.pool.get().set(pos))


        if (dir === undefined)
            dir = this._createDir(v)

        v.dir = dir
        Vector3.add(v.aabb.center, centerAdd, pos)
        v.center.set(centerAdd)
        v.indexCenter.set(indexCenter)

        Vector3.set(v.aabb.halfExtents, CCubeSize)
        return v
    }


    private _createDatas(logic2x2: ILogicData[][]) {
        let index = -1
        for (let x = 0; x < this.size.x; x++)
            for (let y = 0; y < this.size.y; y++)
                for (let z = 0; z < this.size.z; z++) {
                    index++
                    let indexCenter = v3T.set(x * 2, y * 2, z * 2)
                    let center = v3T2
                        .set(indexCenter)
                        .addSelf(CCubeSize)
                        .subSelf(this.orginSizeSub)


                    for (let _2x2 of logic2x2[index]) {
                        this.data.datas.push(_2x2)

                        _2x2.center.set(center)
                        _2x2.indexCenter.set(indexCenter)

                        Vector3.add(_2x2.aabb.center, _2x2.aabb.center, _2x2.center)

                        _2x2.dir = this._createDir(_2x2)
                    }

                }
    }


    private _createDir(data: ILogicData): EBattleDirType {
        // 纯随机方向
        if (data.type == EBattleSizeType["1*1"]) {
            // return EBattleDirType.up
            return Maths.minToMax(EBattleDirType.up, EBattleDirType.right, true, _gameType.curRandom.run())
        }
        let dirs: EBattleDirType[] = []
        for (let value of CXyzTemp)
            if (data.aabb.halfExtents[value as "x"] == 1)
                dirs.push(...CBattleDirs[value as "x"])
        return Sets.random(dirs, undefined, () => _gameType.curRandom.run())
    }


    private _createLogic2x2(sizeDots: TBattleSizeWight[]) {

        let values: ILogicData[][] = []


        for (let dots of sizeDots) {

            // 12
            let types = [EBattleSizeType["2*2"], EBattleSizeType["1*2"], EBattleSizeType["1*1"]]


            let datas: ILogicData[] = []
            let indexByData: number[] = []
            for (let type of types) {
                let count = dots[type]
                for (let i = 0; i < count; i++) {
                    let index = datas.length
                    let data = this.data.pool.get()
                    data.type = type
                    datas.push(data)

                    let typeByCount = type == EBattleSizeType["2*2"] ? 4 : type == EBattleSizeType["1*2"] ? 2 : 1
                    for (let j = 0; j < typeByCount; j++) {
                        indexByData.push(index)
                    }
                }
            }

            // 默认 01 变为 02 12 23
            let count = dots[EBattleSizeType["2*2"]]
            if (count == 1) {
                // 交换位置
                let randomIndex = Maths.zeroToMax(4, _gameType.curRandom.run())
                if (randomIndex != 0) {
                    let value = randomTemp[randomIndex]
                    let temp = JS.deep(indexByData)
                    for (let i = 0; i < 4; i++) {
                        let cur = indexByData[i]
                        indexByData[i] = temp[value[i]]
                        indexByData[value[i]] = cur
                    }
                }
            }

            let index = -1
            for (let x = 0; x < 2; x++)
                for (let y = 0; y < 2; y++)
                    for (let z = 0; z < 2; z++) {
                        index++
                        let dataIndex = indexByData[index]
                        datas[dataIndex].positions.push(Vector3.pool.get().set(x, y, z))
                    }

            // 合并相同的 找到中心点
            for (let data of datas) {
                // 合并大小
                let xs: number[] = []
                let ys: number[] = []
                let zs: number[] = []
                for (let v of data.positions) {
                    Sets.add(xs, v.x)
                    Sets.add(ys, v.y)
                    Sets.add(zs, v.z)
                }
                data.aabb.halfExtents.set(xs.length / 2, ys.length / 2, zs.length / 2)
                Vector3.polygonByCenterPoint(data.aabb.center, data.positions)

            }

            values.push(datas)
        }
        return values
    }

    private _createSizeDots(all2x2: number, allTypes: TBattleSizeWight) {
        // 平均分配到 2x2随机格子中
        let sizeDots: TBattleSizeWight[] = []
        for (let i = 0; i < all2x2; i++) {
            let obj = <TBattleSizeWight>{}
            sizeDots.push(obj)
            for (let j = 0; j <= EBattleSizeType["2*2"]; j++)
                obj[j as any as 0] = 0
        }

        // 由高到低写入
        let count1x4 = allTypes[EBattleSizeType["2*2"]]
        for (let j = 0; j < count1x4; j++) {
            sizeDots[j % all2x2][EBattleSizeType["2*2"]]++
        }

        let count1x2 = allTypes[EBattleSizeType["1*2"]]
        // 写入 1x2 或 1x1
        for (let dots of sizeDots) {
            let sub = 8 - dots[EBattleSizeType["2*2"]] * 4
            // 只有一个1x4
            let max = Math.min(count1x2, sub / 2)
            let count = allTypes[EBattleSizeType["1*1"]] == 0 ? count1x2 : max == 0 ? max : Maths.minToMax(1, max, true, _gameType.curRandom.run())

            allTypes[EBattleSizeType["1*2"]] -= count
            for (let i = 0; i < count; i++) {
                dots[EBattleSizeType["1*2"]]++
            }

            let add1x1 = sub - count * 2
            for (let i = 0; i < add1x1; i++)
                dots[EBattleSizeType["1*1"]]++
        }
        return sizeDots
    }

    private _createWidget(
        widget: TBattleSizeWight,
        all: number,
    ) {
        let widgetAll = 0
        for (let type in widget)
            widgetAll += widget[type as any as 0]
        let widgetRandom: TBattleSizeWight = <any>{}
        for (let type in widget)
            widgetRandom[type as any as 0] = widget[type as any as 0] / widgetAll

        let allTypes: TBattleSizeWight = <any>{}
        // 保证大的
        allTypes[EBattleSizeType["2*2"]] = Math.min(Math.floor(all / 4), Math.floor(all * (widgetRandom[EBattleSizeType["2*2"]] / 4)))
        all -= allTypes[EBattleSizeType["2*2"]] * 4
        allTypes[EBattleSizeType["1*2"]] = Math.min(Math.floor(all / 2), Math.floor(all * (widgetRandom[EBattleSizeType["1*2"]] / 2)))
        all -= allTypes[EBattleSizeType["1*2"]] * 2

        allTypes[EBattleSizeType["1*1"]] = all

        return allTypes
    }


}
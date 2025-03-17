import { Prefab } from "cc";
import { Scene } from "../../../scene/script/Scene";
import { moduleMgr, EModuleType, BaseModuleEvent, _scene, RandomSeed, EPlatformType, EUILayer, IVector3, Maths, Sets, Times, Vector2, Vector3, _main, _prop, _platform, _timer, _ui, _gameType, _logic, _resouces, TShareParam } from "../Main";
import { CBattleCustomCube1x1EntityUrl, CBattleCustomDefaultCubeCount, CBattleCustomDownEntityUrl, CBattleCustomOpenByLevel, CBattleCustomSize, CBattleCustomVidoCubeCount, CBattleDirV3, CCubeSize, CSceneData, EBattleDirType, EBattleSizeType, IBattleCustom, IBattleCustomCacheData, IBattleCustomCacheDataShare, ILogicData } from "./define/LogicDefine";
import { EGameType } from "./define/GameTypeDefine";

const v3T = new Vector3()


@moduleMgr.add(EModuleType.logicCustom)
export class LogicCustomModule extends BaseModuleEvent {

    public readonly EventType = {
        /**数据改变时 index */
        MAP_DATA_CHANGE: "MAP_DATA_CHANGE",
        /**数量改变时 */
        MAP_COUNT_CHANGE: "MAP_COUNT_CHANGE",
    }

    private get scene() { return _scene.getCurrent<Scene>() }
    public data: IBattleCustom = {
        datas: [],
        downs: [],
        all: [],
        dataByPos: [],
        state: true,
    }
    public random = new RandomSeed()
    public runData: IBattleCustomCacheDataShare = null!
    public runFrinend: boolean = false
    public offset = new Vector3()

    onCreate() {
        this.offset.x = CBattleCustomSize.x / 2 + CCubeSize.x
        this.offset.y = CBattleCustomSize.y / 2 + CCubeSize.y
        this.offset.z = CBattleCustomSize.z / 2 + CCubeSize.z

    }

    public onLogic(): void {

        // 上报通过分享进入的
        _main.on(_main.EventType.SHOW_QUERY, (str: string) => {
            let obj = JSON.parse(str) as any[]

            if (obj[0] === this.shareMapQuery) {
                _platform.instance.reportEvent("share", {
                    shareid: obj[1],
                    sharetextid: obj[2],
                    sharetype: 4,
                })

                // 进入好友关卡
                let complete = () => {
                    _timer.once(this, () => {
                        _ui.open(CSceneData.uiUrl.CustomFriendUI, obj[3])
                    }, 1)
                }
                if (!this.scene) {
                    _scene.once(_scene.EventType.CHANG_SUCCESS, complete)
                }
                else {
                    complete()
                }
            }
        })
    }


    private camera = {
        position: new Vector3(15, 10, 15),
        dis: new Vector2(4, 40),
        rotate: new Vector3(),
    }

    public get editorIndex() { return this.storage.get("editorIndexCur", 0) }

 

    public remove(index: number) {
        _ui.tip("删除成功")
        let data = this.data.datas[index]
        this.scene.entityMgr.remove(data.customCube1x1Entity)
        this.data.all[this.data.all.indexOf(data)] = null!
        this.data.datas[index] = null!
        _logic.data.pool.put(data)

        // 转换为索引
        let posIndex = this.getPosIndex(data.indexCenter)
        this.data.dataByPos[posIndex] = undefined!
        this.setMap(this.editorIndex)
    }

    private isCustomLoad = false

    public load(complete: () => void, loading: boolean) {
        if (!this.isCustomLoad) {
            if (loading)
                _ui.Loading.wait(true)
            _resouces.loadDir([
                { url: "scene/prefab/ui/CustomEditorUI", type: Prefab },
                { url: CBattleCustomDownEntityUrl, type: Prefab },
                { url: CBattleCustomCube1x1EntityUrl, type: Prefab },
            ], () => {
                this.isCustomLoad = true
                complete()
            })
        }
        else
            complete()
    }

    public getStepSub(index: number) {
        let map = this.getMap(index)
        let count = this.deDataByCreateCount(map.data.p)
        let sub = map.data.t - count
        return sub
    }

    public getMap(index: number) {
        return this.storage.get("map" + index, null!) as IBattleCustomCacheData
    }

    public addMap() {
        let max = this.getMapCount()
        this.storage.set("mapCount", max + 1)
        this.storage.set("map" + max, <IBattleCustomCacheData>{
            createTime: Times.second(),
            updateTime: Times.second(),
            data: {
                t: CBattleCustomDefaultCubeCount,
                p: [],
                s: 1,
            },
        })

        this.emit(this.EventType.MAP_COUNT_CHANGE)

        return max
    }

    public addMapCubeCount(index: number, mul = 1) {
        let data = this.getMap(index)
        data.data.t += CBattleCustomVidoCubeCount * mul
        this.updateMap(index, data)
    }

    public getMapCount() {
        return this.storage.get("mapCount", 0)
    }

    public setMap(index: number) {
        _timer.callLater(this, this._setMap, [index])
    }

    private _setMap(index: number) {
        let data = this.getMap(index)

        this.enData(data.data.p)
        data.updateTime = Times.second()

        this.updateMap(index, data)
    }

    private updateMap(index: number, data: IBattleCustomCacheData) {
        // console.log("设置数据:", data)
        this.storage.set("map" + index, data)
        this.emit(this.EventType.MAP_DATA_CHANGE, index)
    }

    public shareMapQuery = "shareMap"

    public shareMap(index: number) {
        let map = this.getMap(index)
        if (this.deDataByCreateCount(map.data.p) == 0) {
            _ui.tip("地图暂无数据")
            return
        }
        map.data.s = _logic.arrowSkin.cur
        let param = <TShareParam>{
            title: "快来挑战我自定义的关卡吧！",
            imageUrl: "subpackages/shareImg/custom.jpg",
        }

        // qq 携带query，不能使用分包图片，
        if (_platform.type == EPlatformType.qq)
            param.imageUrl = "custom.jpg"

        let reportObj = [
            this.shareMapQuery,
            param.imageUrl,
            (_platform.config.share.list as any).title.length,
            map.data,
        ]

        // 携带query
        param.query = JSON.stringify(reportObj)

        _platform.instance.reportEvent("share", {
            shareid: reportObj[1],
            sharetextid: reportObj[2],
            sharetype: 3,
        })
        _platform._share_.show(param, (success) => {
            _ui.tip("分享成功")
        })
    }

    public deDataByCreateCount(arr: number[]) {
        let count = 0
        for (let i = 0; i < arr.length; i++) {
            let v = arr[i]
            let isHave = i % 2 == 0
            if (isHave)
                count += v
        }
        return count
    }


    public deData(arr: number[]) {
        let datas: number[] = []
        for (let i = 0; i < arr.length; i++) {
            let v = arr[i]
            let isHave = i % 2 == 0
            for (let j = 0; j < v; j++) {
                if (isHave)
                    datas.push(1)
                else
                    datas.push(0)
            }
        }
        return datas
    }

    public enData(arr: number[]) {
        arr.length = 0
        // 方块位置数据 偶数位为有 奇数位为没有
        let max = CBattleCustomSize.x * CBattleCustomSize.y * CBattleCustomSize.z
        let num = 0
        let have = true
        for (let i = 0; i < max; i++) {
            let data = this.data.dataByPos[i]
            let isData = data !== undefined
            if (have) {
                if (isData) {
                    num++
                }
                else {
                    arr.push(num)
                    have = false
                    num = 1
                }
            }
            else {
                if (isData) {
                    arr.push(num)
                    have = true
                    num = 1
                }
                else {
                    num++
                }
            }
        }
    }

    public createCube(cur: ILogicData, createDir: EBattleDirType) {
        if (this.getStepSub(this.editorIndex) <= 0) {
            _ui.tip("步数不足")
            _platform._vibrate_.short()
            return
        }

        let dir = CBattleDirV3[createDir]
        Vector3.add(v3T, dir, cur.indexCenter)
        if (v3T.x < 0
            || v3T.y < 0
            || v3T.z < 0
            || v3T.x >= CBattleCustomSize.x
            || v3T.y >= CBattleCustomSize.y
            || v3T.z >= CBattleCustomSize.z
        ) {
            _ui.tip("超出最大边界")
            return
        }
        if (Sets.filterValue(this.data.all, v => v && v.indexCenter.equals(v3T))) {
            _ui.tip("已有方块")
            return
        }
        // UIMgr.tip("创建成功")

        this._createCube(v3T, true)

        this.setMap(this.editorIndex)
    }

    private _createCube(pos: Vector3, createEntity: boolean) {
        let data = _logic.create1x1(pos, undefined, pos)
        Vector3.sub(data.aabb.center, data.aabb.center, this.offset)
        let index = this.data.datas.length
        this.data.datas.push(data)
        this.data.all.push(data)
        if (createEntity)
            data.customCube1x1Entity = this.scene.entityMgr.createCustomCube1x1(index)

        // 转换为索引
        let posIndex = this.getPosIndex(pos)
        this.data.dataByPos[posIndex] = index
    }

    public getPosIndex(value: IVector3) {
        return value.x * CBattleCustomSize.x * CBattleCustomSize.y + value.y * CBattleCustomSize.y + value.z
    }

    public enter() {
        if (_logic._level.level.cur > CBattleCustomOpenByLevel) {
            _ui.open("scene/prefab/ui/CustomMapUI")
        }
        else {
            _ui.dialogue(
                "通过第" + CBattleCustomOpenByLevel + "关解锁自定义",
                {
                    text: "关闭",
                    onClick: () => {
                    },
                },
                {
                    text: "前往挑战",
                    color: "darkBlue",
                    onClick: () => {
                        _gameType.run(EGameType.level)
                    },
                },
            )
        }
    }
}
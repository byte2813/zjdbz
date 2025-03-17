import { Vec2, Vec3, Camera, Node, EventTouch, EventMouse, rect, Label, game, Prefab, Size, MeshRenderer, Texture2D, geometry } from "cc"
import { ccclass, BaseScene, LoadDir, _config_, _guide, EPlatformType, _ui, Polygon, NodeHelper, IVector2, _timer, Maths, _logic, Rectangle, Sets, _main, RectHollow, Vector2, IGuideMaskUIText, BaseHollow, EventHandlerCC, ETweenType, TweenHelper, EUIState, _audio, EEntityState, _language, PoolOnce, Times, property, _platform, Move, _resouces, _gameType, winCenterPostion, Vector3, _login, _prop, CameraOrbitControlCC, _logicCustom } from "../../main/script/Main"
import { EntityMgr } from "./EntityMgr"
import { CBattleSizeTypeImgNames, CCubeColliderDis, CSceneData, EBattleDirType, EEntityType, ILogicData } from "../../main/script/module/define/LogicDefine"
import { EGameType } from "../../main/script/module/define/GameTypeDefine"
import { CubeEntity } from "./entity/CubeEntity"
import { initData } from "../../app/GameDefine"


const v2T = new Vec2()
const rayT = new geometry.Ray()
const v3T = new Vector3()
const v3T2 = new Vec3()
const v3T3 = new Vec3()

const v3T4 = new Vec3()
const v3T5 = new Vec3()
const v3T6 = new Vec3()
const option: geometry.IRayMeshOptions = { mode: geometry.ERaycastMode.CLOSEST, doubleSided: true, distance: 300 };

const _planes: { [type in `${EBattleDirType}`]: geometry.Plane } = {
    [EBattleDirType.back]: new geometry.Plane(),
    [EBattleDirType.down]: new geometry.Plane(),
    [EBattleDirType.front]: new geometry.Plane(),
    [EBattleDirType.left]: new geometry.Plane(),
    [EBattleDirType.right]: new geometry.Plane(),
    [EBattleDirType.up]: new geometry.Plane(),
}

@ccclass("Scene")
export class Scene extends BaseScene {

    public entityMgr = new EntityMgr(this)

    public cContent: Node = null!
    public cCamera_scene: Camera = null!
    private cASceneOffset: Node = null!

    private orbitControls: CameraOrbitControlCC = null!
    private startEntity: ILogicData = null!

    private isRotate: boolean = true
    public isIndexShow: boolean = true
    public isLoadComplete: boolean = false
    private rotateNum = 0

    private isNewUserUI = false
    private isNewUserUI2 = false

    onCreate() {
        this.orbitControls = this.cCamera_scene.getComponent(CameraOrbitControlCC)!

        this.addEvent(_logic.EventType.CHANGE_SKIN_COMPLETE, this.updateSkin, this, _logic)

        this.addEvent(_ui.EventType.OPEN, (url: string) => {
            if (url == initData.uiUrl.index) {
                this.isIndexShow = true
                this.isRotate = true
                this.rotateNum = 0
                NodeHelper.setRotateY(this.cContent, this.rotateNum, false)
            }
            if (url !== CSceneData.uiUrl.RunUI && url !== "guide/prefab/GuideFingerUI")
                this.closeNewUserFinger()
        }, this, _ui)

        this.addEvent(_ui.EventType.CLOSE, (url: string) => {
            if (url == initData.uiUrl.index) {
                this.isIndexShow = false
            }
        }, this, _ui)

        this.isIndexShow = _ui.getModule(initData.uiUrl.index).state == EUIState.Open
    }

    onUpdate() {
        this.entityMgr.updateStateMachine()
        // 旋转
        if (this.isIndexShow) {
            if (this.isRotate) {
                this.rotateNum += _timer.dtDefault * 10
                NodeHelper.setRotateY(this.cContent, this.rotateNum, false)
            }
        }
    }

    public create(isAnim: boolean = true) {
        if (_gameType.type == EGameType.index)
            isAnim = false

        this._createInit()

        let indexs: number[] = []
        for (let i = 0; i < _logic.data.datas.length; i++) {
            if (_logic.data.datas[i])
                indexs.push(i)
        }
        if (!_login.isNewUser)
            Sets.shuffle(indexs)

        let interval = 100 / (_logic.data.datas.length * 1250)
        let speed = 1 / 100

        if (!isAnim) {
            interval = 0
            speed = 0
        }

        if (_gameType.type == EGameType.today) {
            if (_logic._today.configIndex == 1) {
                interval *= .2
                speed = 1 / 500
            }
        }
        else if (_gameType.type == EGameType.shape) {
            interval *= 3
            speed = 1 / 500
        }

        let max = this.getInterval(indexs.length, speed) + .05
        console.log("分帧加载时间", max)
        this.scheduleOnce(() => {
            this.isLoadComplete = true

            // 开启新手引导
            if (!this.isNewUserUI2)
                if (_login.isNewUser) {

                    _guide.finger({
                        position: () => {
                            this.entityMgr.entitesType.get(EEntityType.Cube)
                                .get<CubeEntity>(1).getUIPosition(v2T)
                            return v2T
                        },
                        touchStartCloseUI: false,
                        delay: .7,
                    })
                    this.isNewUserUI2 = true
                    this.isNewUserUI = true
                }

            // 检测无方向可消
            if (!this.isIndexShow)
                this.checkAllRemove()
        }, max)

        for (let i = 0; i < indexs.length; i++) {
            let index = indexs[i]
            let data = _logic.data.datas[index]
            let delay = this.getInterval(i, speed)
            this.scheduleOnce(() => {
                data.entity = this.entityMgr.createCube(index, isAnim, i * interval)
            }, delay)
        }

    }

    public closeNewUserFinger() {
        if (this.isNewUserUI) {
            this.isNewUserUI = false
            _guide.closeFinger()
        }
    }

    private getInterval(i: number, speed: number) {
        // 每帧创建20个
        return Math.floor(i / 1) * speed
    }

    /**
     * 偷偷加载资源
     * @param url 
     * @param count 
     */
    public preCube(url: string, count: number, interval: number) {
        let sub = count - this.entityMgr.pool.pool(url).size()
        for (let i = 0; i < sub; i++) {
            this.scheduleOnce(() => {
                this.entityMgr.createPreCube(url)
            }, (i + 1) * interval)
        }
    }

    private updateSkin() {
        this.entityMgr.entitesType.get(EEntityType.Cube)
            .forEach<CubeEntity>(v => {
                this.updateCubeSkin(v.data, v.meshRenders)
            })
    }

    public touchStart(e: EventTouch) {
        if (this.hasCreate()) {
            this.startEntity = this.touchData(e, rayT, _logic.data.datas)
            this.isRotate = false
        }
    }

    public touchMove(e: EventTouch) {
        this.orbitControls.onMouseMove(e)
        this.closeNewUserFinger()
    }

    public mouseWheel(e: EventMouse) {
        this.orbitControls.onMouseWheel(e)
    }

    private touchData(e: EventTouch, ray: geometry.Ray, datas: ILogicData[]) {
        e.getLocation(v2T)
        this.cCamera_scene.screenPointToRay(v2T.x, v2T.y, ray)
        return this.rayByData(ray, datas)
    }

    public touchEnd(e: EventTouch) {
        if (this.hasCreate()) {
            if (this.isIndexShow)
                this.scheduleOnceCover(this.onDelayRotate, .8)

            let entity = this.touchData(e, rayT, _logic.data.datas)
            let startEntity = this.startEntity
            this.startEntity = null!
            if (!entity)
                return

            if (EventHandlerCC.touchIsMoveRun) {
                if (startEntity != entity)
                    return
                let comp = _logic.getFront(entity.entity.index)
                if (comp)
                    return
                entity.entity.click(true)
            }
            else {
                entity.entity.click()
            }
            this.closeNewUserFinger()

            // 检测无方向可消
            if (!this.isIndexShow)
                this.checkAllRemove()
        }

        else if (_gameType.type == EGameType.customEditor) {
            if (!EventHandlerCC.touchIsMoveRun) {
                let data = this.touchData(e, rayT, _logicCustom.data.all)
                if (data) {
                    if (data.customDownEntity)
                        data.customDownEntity.click(rayT)
                    else {
                        if (data.customCube1x1Entity)
                            data.customCube1x1Entity.click(rayT)
                    }
                }
            }
        }
    }

    private onDelayRotate() {
        this.isRotate = true
    }

    public checkAllRemove() {
        if (_logic.data.count() <= 1)
            return

        if (!this._checkAllRemove())
            return

        let datas: number[] = []
        let i = -1
        for (let v of _logic.data.datas) {
            i++
            if (v && v.entity && v.entity.entityStateMackine.state == EEntityState.Run) {
                datas.push(i)
            }
        }
        Sets.shuffle(datas)

        let index = -1
        while (true) {
            index++
            if (datas[index] === undefined)
                break
            _logic.dirBack(datas[index])
            if (!this._checkAllRemove())
                break
        }
    }

    private _checkAllRemove() {

        for (let i = 0; i < _logic.data.datas.length; i++) {
            let v = _logic.data.datas[i]
            if (v && v.entity)
                if (!_logic.getFront(i))
                    return false
        }

        return true
    }

    private hasCreate() {
        if (_gameType.type == EGameType.index
            || _gameType.type == EGameType.level
            || _gameType.type == EGameType.shape
            || _gameType.type == EGameType.today
            || _gameType.type == EGameType.custom
        )
            return true
        return false
    }


    public rayByData(ray: geometry.Ray, datas: ILogicData[], index?: number) {
        // 没办法解决 里面的方向检测
        let entity: ILogicData = null!
        if (!this.isLoadComplete)
            return entity
        let distance = 500

        let i = -1
        for (let data of datas) {
            i++
            if (index != undefined)
                if (i == index)
                    continue
            if (!data)
                continue
            if (this.hasCreate()) {
                if (!data.entity)
                    continue
            }
            else {
                if (!data.customDownEntity && !data.customCube1x1Entity)
                    continue
            }
            // 主页自转，世界坐标改变
            if (_gameType.type == EGameType.index)
                Vector3.set(data.aabb.center, data.entity.node.worldPosition)

            let dis = geometry.intersect.rayAABB(ray, data.aabb)
            if (dis > 0 && dis < distance) {
                distance = dis
                entity = data
            }
        }

        return entity
    }

    public rayMeshs(ray: geometry.Ray, meshs: MeshRenderer[]): number {
        let distance = 300
        let index = -1
        let i = -1
        for (let v of meshs) {
            i++
            let dis = this.rayMesh(ray, v)
            if (dis && dis < distance) {
                distance = dis
                index = i
            }
        }
        return index
    }

    public rayMesh(ray: geometry.Ray, mesh: MeshRenderer) {
        return geometry.intersect.rayModel(ray, mesh.model!, option)
    }

    public colliderAnim(index: number) {

        let data = _logic.data.datas[index]
        let datas: ILogicData[] = []
        _logic.getFronts(data, data, datas, 0)

        // 距离衰减
        let disSubRatio = .1
        // 起移动距离
        let startDis = CCubeColliderDis

        // 速度衰减
        let speedSubRatio = .2
        // 起始速度
        let startSpeed = 1

        let i = -1
        for (let v of datas) {
            i++
            v.entity.colliderAnim(
                data.entity,
                startSpeed * Math.pow(1 - speedSubRatio, v.frontIndex!),
                startDis * Math.pow(1 - disSubRatio, v.frontIndex!),
            )
        }

    }

    public custom() {
        this._createInit()
        this.isLoadComplete = true
        for (let i = 0; i < _logicCustom.data.downs.length; i++)
            _logicCustom.data.downs[i].customDownEntity = this.entityMgr.createCustomDown(i)

        // 创建已有的
        let i = -1
        for (let data of _logicCustom.data.datas) {
            i++
            data.customCube1x1Entity = this.entityMgr.createCustomCube1x1(i)
        }
    }


    private _createInit() {
        this.isLoadComplete = false
        this.unscheduleAllCallbacks()
        _timer.clearAll(this)
        NodeHelper.setRotateY(this.cContent, 0, false)
        // 回收所有的
        this.entityMgr.clear(false)
        this.initCamera()
    }

    private initCamera() {
        NodeHelper.setRotate(this.cCamera_scene.node, _logic.cameraRotate, false)
        NodeHelper.setPosition(this.cCamera_scene.node, _logic.cameraPosition, false)
        this.orbitControls.minDistance = _logic.cameraDis.x
        this.orbitControls.maxDistance = _logic.cameraDis.y

        // 整体场景偏移
        let sceneOffsetY = 0
        if (_gameType.type == EGameType.customEditor) {
            sceneOffsetY = -2
        }
        this.orbitControls.target.set(0, sceneOffsetY, 0)

        this.orbitControls.reset()
    }

    public updateCubeSkin(data: ILogicData, meshRenders: MeshRenderer[]) {

        if (_gameType.type == EGameType.shape) {
            return
        }

        let id = _logic.arrowSkin.cur

        // if (_battle.levelType == EBattleLevelType.custom) {
        //     if (_battleCustom.runFrinend) {
        //         if (_battleCustom.runData.s && _battleCustom.runData.s > 0)
        //             id = _battleCustom.runData.s
        //     }
        // }

        let url = _config_.obj.skin_item[id].scene_url

        let i = -1
        for (let mesh of meshRenders) {
            i++
            let name = CBattleSizeTypeImgNames[data.type][i]
            let imgUrl = _logic.converSkinUrl(url, name)
            let texture = _resouces.get(imgUrl, Texture2D) as any
            mesh.sharedMaterial!.setProperty("mainTexture", texture)
        }

    }

}


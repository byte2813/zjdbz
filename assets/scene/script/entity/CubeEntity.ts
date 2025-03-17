import { MeshRenderer, Node, Sprite, SpriteFrame, Vec3 } from "cc";
import { AABB, EEntityState, EPlatformType, ETweenType, IVector2, IVector3, Maths, Move, NodeHelper, Sets, TweenHelper, Vector2, Vector3, _audio, _config_, _gameType, _logic, _platform, _resouces, _timer, _ui, ccclass, winCenterPostion, winSize } from "../../../main/script/Main";
import { CBattleDirAngle, CBattleDirV3, CBattleDirXYZ, CCubeColliderDis, CCubeSize, CCubeSizeAddV3, CSceneData, EBattleDirType, EBattleSizeType, EEntityType, ILogicData } from "../../../main/script/module/define/LogicDefine";
import { Entity } from "./Entity";
import { EGameType } from "../../../main/script/module/define/GameTypeDefine";


const v3y90 = new Vector3(0, 90, 0)
const v3T = new Vector3(0, 0, 0)
const v3T2 = new Vector3(0, 0, 0)
const v3T3 = new Vector3(0, 0, 0)
const v3One = new Vector3(1, 1, 1)
const v3Temp = new Vector3(0, 0, 0)
const aabbT = new AABB()
const v3T4 = new Vec3()


@ccclass("CubeEntity")
export class CubeEntity extends Entity {

    public entityType = EEntityType.Cube
    public isPut = true
    public isUpdateStateMackine = true
    public isDestroy = false
    public isMoving() {
        return false
    }

    public index: number = -1
    public delayShow: number = -1
    public isAnim: boolean = false

    public data: ILogicData = null!
    private _move = new Move()

    private isScaleAnim = false
    private isRotateAnim = false
    private toRotate = new Vector3()

    public meshRenders: MeshRenderer[] = null!

    private scaleRatio = 0

    protected onStateEnterLoad() {
        super.onStateEnterLoad()
        this.data = _logic.data.datas[this.index]
        this.meshRenders = this.getComponentsInChildren(MeshRenderer)
        this.setScaleNum(0, false)
        this._move.init(this.node, false, 10)

        _timer.deleteDirtyMark("BattleCubeEntity" + this.index)
    }


    protected onStateEnterRun() {
        super.onStateEnterRun()
        this.isRotateAnim = false
        this.scene.updateCubeSkin(this.data, this.meshRenders)

        if (_gameType.type == EGameType.shape) {
            let i = -1
            for (let mesh of this.meshRenders) {
                i++
                let colorId = _logic._shape.data.curColors[this.index]
                let mat = _logic._shape.data.matMap[colorId]
                if (i == EBattleDirType.down || i == EBattleDirType.up)
                    mesh.setMaterial(mat.color, 0)
                else
                    mesh.setMaterial(mat.img, 0)
            }
        }


        NodeHelper.setRotate(this.node.children[0], Vector3.ZERO, false)
        if (this.data.type == EBattleSizeType["2*2"]) {
            // 更换方向
            if (this.data.aabb.halfExtents.y == (CCubeSize.y + CCubeSizeAddV3.y) && (this.data.dir == EBattleDirType.back
                || this.data.dir == EBattleDirType.front)) {
                NodeHelper.setRotate(this.node.children[0], v3y90, false)
            }
        }


        this.isScaleAnim = false
        this.setRotate(CBattleDirAngle[this.data.dir], false)
        if (this.isAnim) {
            this.scaleRatio = Maths.minToMax(.03, .06, false)
            // 生成动画
            this.setScaleNum(.3, false)

            _logic.getDirMul(v3Temp, this.data.dir, 8, true)
            v3Temp.addSelf(this.data.aabb.center)

            this.setPosition(v3Temp, false)
            this._move.setRunData(1, (v) => {
                v.target.set(this.data.aabb.center)
                v.speed = 20
            })
            this.scheduleOnce(() => {

                // 有一些未回调 不清楚原因
                this._move.run()
                this.isScaleAnim = true
            }, this.delayShow)
        }
        else {
            this.setScaleNum(1, false)
            this.setPosition(this.data.aabb.center, false)
        }
    }


    protected onStateUpdateRun() {
        super.onStateUpdateRun()

        this._move.onUpdate()


        if (this.isScaleAnim) {
            // 快要接近时放大
            if (Vector3.equals(this.data.aabb.center, this.getPosition(false), .8))
                // 由小放大
                if (this.lerpScaleTarget(v3One, this.scaleRatio, false)) {
                    this.setScaleNum(1, false)
                    this.isScaleAnim = false
                }
        }

        // 方向翻转动画
        if (this.isRotateAnim) {
            // 由小放大
            if (NodeHelper.lerpRotateTarget(this.node, this.toRotate, .1, false))
                this.isRotateAnim = false
        }

    }

    protected onStateUpdateOver() {
        super.onStateUpdateOver()
        this._move.onUpdate()
    }

    protected onStateEnterOver() {
        super.onStateEnterOver(false)

        if (_platform.type != EPlatformType.oppo)
            _platform._vibrate_.short()
        _audio.play(CSceneData.audio.remove)
        if (_logic.data.count() <= 1) {
            _gameType.isRun = false
        }

        _logic.data.remove(this.index)


        this._move.setRunData(1, (v) => {
            _logic.getDirMul(v.target, this.data.dir, 20)
            v.target.addSelf(this.data.aabb.center)
            v.speedMul = 3
        })
        this._move.run(() => {
            this.scene.entityMgr.remove(this)
        })
    }

    protected onStateEnterExit(arg?: string) {

        this._move.clear()
        super.onStateEnterExit()

        if (!_gameType.isRun) {
            if (this.scene.entityMgr.entitesType.get(EEntityType.Cube).size == 1
                && _logic.data.hasZero())
                _gameType._runComplete.run(true)
        }

    }

    public dis(other: CubeEntity) {
        aabbT.set(this.data.aabb.center, this.data.aabb.halfExtents)
        aabbT.halfExtents.subSelf(CCubeSizeAddV3)
        v3T.set(AABB.ptPointAabb(aabbT, other.data.aabb.center))

        aabbT.set(other.data.aabb.center, other.data.aabb.halfExtents)
        aabbT.halfExtents.subSelf(CCubeSizeAddV3)
        v3T2.set(AABB.ptPointAabb(aabbT, this.data.aabb.center))


        let type = CBattleDirXYZ[this.data.dir].cur
        let dis = Math.abs(v3T[type] - v3T2[type])
        // 减去扩充的一圈

        return dis
    }

    public colliderAnim(other: CubeEntity, speedMul: number, dis: number) {
        this._move.setRunData(2, (v, index) => {
            v.target.set(this.data.aabb.center)
            if (index == 0) {
                let type = CBattleDirXYZ[other.data.dir].cur
                // 超出部分
                v.target[type] += CBattleDirV3[other.data.dir][type] * dis
                v.speedMul = speedMul
            }
            else {
                v.speedMul = 1.5
            }
        })
        this._move.run()
    }

    public dirBack() {
        this.toRotate.set(CBattleDirAngle[this.data.dir])
        this.isRotateAnim = true
    }

    public randomRemove() {
        this.entityStateMackine.change(EEntityState.Over)
    }


    public click(success = false) {
        // 首页点击动画
        if (this.scene.isIndexShow) {
            _logic.dirBack(this.index)
            return
        }

        if (
            _gameType.type == EGameType.level
        ) {
            if (_logic.data.count() <= 1)
                if (_logic._level.step.cur <= 1) {
                    _gameType.isRun = false
                }
            _logic._level.step.sub(1)
        }

        // 飞出去
        if (success) {
            this.entityStateMackine.change(EEntityState.Over)
            return
        }

        let comp = _logic.getFront(this.index)
        if (!comp) {
            this.entityStateMackine.change(EEntityState.Over)
            return
        }

        // 失败
        if (_platform.type != EPlatformType.oppo) {
            _platform._vibrate_.short()
            this.scheduleOnce(() => {
                _platform._vibrate_.short()
            }, .1)
        }

        let dis = this.dis(comp.entity);
        if (dis == 0) {
            this.scene.colliderAnim(this.index)
        }
        this._move.setRunData(2, (v, index) => {
            v.target.set(this.data.aabb.center)
            if (index == 0) {

                let type = CBattleDirXYZ[this.data.dir].cur
                // 超出部分
                v.target[type] += CBattleDirV3[this.data.dir][type] * CCubeColliderDis
                if (dis > 0) {
                    _logic.getDirMul(v3T3, this.data.dir, dis)
                    // 刚好移动到边缘
                    v.target[type] += v3T3[type]
                    v.onEnd = () => {
                        this.scene.colliderAnim(this.index)
                    }
                }

                v.speedMul = 1
            }
            else {
                v.speedMul = 1.5
            }
        })
        this._move.run(() => {
            if (!_gameType.isRun) {
                _gameType._runComplete.run(false)
            }
        })

    }

    public getUIPosition(out: IVector2, center: IVector3 = this.data.aabb.center) {
        v3T4.set(center.x, center.y, center.z)
        this.scene.cCamera_scene.convertToUINode(
            v3T4,
            _ui.getZeroWorldPointNode(),
            v3T4
        )
        Vector2.set(out, v3T4)
    }
}
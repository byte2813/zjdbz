
import { Color, MeshRenderer, geometry } from "cc";
import { Vector3, AABB, ccclass, _logicCustom } from "../../../main/script/Main";
import { EBattleDirType, EEntityType, ILogicData } from "../../../main/script/module/define/LogicDefine";
import { Entity } from "./Entity";

const v3y90 = new Vector3(0, 90, 0)
const v3T = new Vector3(0, 0, 0)
const v3T2 = new Vector3(0, 0, 0)
const v3T3 = new Vector3(0, 0, 0)
const v3One = new Vector3(1, 1, 1)
const v3Temp = new Vector3(0, 0, 0)
const v3Temp2 = new Vector3(0, 0, 0)
const v3TAnimStart = new Vector3(0, 0, 0)

const colorWhite = new Color(255, 255, 255)
const colorGray = new Color(180, 180, 180)
const colorT = new Color()
const aabbT = new AABB()

@ccclass("CustomDownEntity")
export class CustomDownEntity extends Entity {

    public entityType = EEntityType.CustomDown
    public isPut = true
    public isUpdateStateMackine = true
    public isDestroy = false
    public isMoving() {
        return false
    }

    public index: number = -1
    public data: ILogicData = null!

    private meshRender: MeshRenderer = null!
    private meshDownRender: MeshRenderer = null!

    protected onStateEnterLoad() {
        super.onStateEnterLoad()
        this.data = _logicCustom.data.downs[this.index]
        let meshs = this.getComponentsInChildren(MeshRenderer)!
        this.meshRender = meshs[0]
        this.meshDownRender = meshs[1]
    }


    protected onStateEnterRun() {
        super.onStateEnterRun()
        this.setPosition(this.data.aabb.center, false)
    }


    public click(ray: geometry.Ray) {
        if (!_logicCustom.data.state)
            return
        let dis = this.scene.rayMesh(ray, this.meshRender)
        let disDown = this.scene.rayMesh(ray, this.meshDownRender)

        if (disDown == 0 && dis == 0) {
            this.downRay(ray)
        }
        else {

            if (disDown != 0)
                if (dis != 0)
                    if (dis <= disDown)
                        _logicCustom.createCube(this.data, EBattleDirType.up)
                    else
                        this.downRay(ray)
                else
                    this.downRay(ray)
            else {
                if (dis > 0)
                    _logicCustom.createCube(this.data, EBattleDirType.up)
            }
        }
    }

    /**穿透 */
    private downRay(ray: geometry.Ray) {
        let data = this.scene.rayByData(ray, _logicCustom.data.datas)
        if (data)
            if (data.customCube1x1Entity)
                data.customCube1x1Entity.click(ray)
    }

}
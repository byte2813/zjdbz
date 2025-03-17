
import { Color, geometry, MeshRenderer, Texture2D } from "cc";
import { Entity } from "./Entity";
import { EBattleDirType, EEntityType, ILogicData } from "../../../main/script/module/define/LogicDefine";
import { _logicCustom, ccclass } from "../../../main/script/Main";



@ccclass("CustomCube1x1Entity")
export class CustomCube1x1Entity extends Entity {

    public entityType = EEntityType.CustomCube1x1
    public isPut = true
    public isUpdateStateMackine = true
    public isDestroy = false
    public isMoving() {
        return false
    }

    public index: number = -1

    private data: ILogicData = null!

    private meshRenders: MeshRenderer[] = null!

    protected onStateEnterLoad() {
        super.onStateEnterLoad()
        this.data = _logicCustom.data.datas[this.index]
        this.meshRenders = this.getComponentsInChildren(MeshRenderer)
    }


    protected onStateEnterRun() {
        super.onStateEnterRun()
        this.scene.updateCubeSkin(this.data, this.meshRenders)

        this.setScaleNum(1, false)
        this.setPosition(this.data.aabb.center, false)
        // this.setRotate(CBattleDirAngle[this.data.dir], false)
    }

    public click(ray: geometry.Ray) {
        if (!_logicCustom.data.state) {
            _logicCustom.remove(this.index)
            return
        }
        let index = this.scene.rayMeshs(ray, this.meshRenders)
        if (index !== -1) {
            let name = this.meshRenders[index].node.name
            let type = EBattleDirType[name as "up"]
            _logicCustom.createCube(this.data, type)
        }
    }



}
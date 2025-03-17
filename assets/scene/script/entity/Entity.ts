import { Material, MeshRenderer, Node } from "cc";
import { BaseEntity, EEaseType, EEntityState, IVector2, Maths, Move, NodeHelper, Rotate360Anim, Vector2, _logic, _scene, ccclass } from "../../../main/script/Main";
import { EEntityType } from "../../../main/script/module/define/LogicDefine";
import { Scene } from "../Scene";
import { EntityMgr } from "../EntityMgr";

const v2T = new Vector2()

@ccclass("Entity")
export abstract class Entity extends BaseEntity {

    public abstract entityType: EEntityType
    public abstract isPut: boolean
    public abstract isUpdateStateMackine: boolean | (() => boolean)
    public abstract isDestroy: boolean
    public abstract isMoving(): boolean

    public entityMgr: EntityMgr = null!

    public get scene() { return _scene.getCurrent<Scene>() }

    protected onStateEnterLoad(): void {
        super.onStateEnterLoad()

    }

    protected onStateEnterRun(): void {
        super.onStateEnterRun()
    }

    protected onStateUpdateRun(): void {
        super.onStateUpdateRun()

    }

    protected onStateEnterOver(isWin: boolean): void {
        super.onStateEnterOver(isWin)
    }

    protected onStateEnterExit(arg?: string) {
        super.onStateEnterExit()
    }

}
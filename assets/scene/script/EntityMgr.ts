import { Node, Vec2, Vec3 } from "cc";
import { BaseEntityMgr, EEntityState, IVector2, NodeHelper, P2Body, TVectorSet, _logic, _timer } from "../../main/script/Main";
import { Scene } from "./Scene";
import { CBattleCustomCube1x1EntityUrl, CBattleCustomDownEntityUrl, CResoucesLoadPriority, CSceneData } from "../../main/script/module/define/LogicDefine";
import { Entity } from "./entity/Entity";
import { CubeEntity } from "./entity/CubeEntity";
import { CustomDownEntity } from "./entity/CustomDownEntity";
import { CustomCube1x1Entity } from "./entity/CustomCube1x1Entity";




export class EntityMgr extends BaseEntityMgr<Scene, Entity> {


    protected getQueueResoucesPriority(): number[] { return CResoucesLoadPriority }

    public createCube(index: number, isAnim: boolean, animDelay: number) {
        let url = _logic.getCubeUrl(index)

        let entity = this.create<CubeEntity>(url)
        entity.index = index
        entity.isAnim = isAnim
        entity.delayShow = animDelay
        entity.entityStateMackine.change(EEntityState.Load)
        this.scene.cContent.addChild(entity.node)
        entity.entityStateMackine.change(EEntityState.Reset)
        entity.entityStateMackine.change(EEntityState.Run)
        return entity
    }


    public createPreCube(url: string) {
        let entity = this.create<CubeEntity>(url, false)
        entity.setPositionX(-10000000, false)
        this.scene.cContent.addChild(entity.node)
        _timer.callLater(this, () => {
            this.pool.put(entity.node)
        })
    }

    public createCustomDown(index: number) {
        let entity = this.create<CustomDownEntity>(CBattleCustomDownEntityUrl)
        entity.index = index

        entity.entityStateMackine.change(EEntityState.Load)
        this.scene.cContent.addChild(entity.node)
        entity.entityStateMackine.change(EEntityState.Reset)
        entity.entityStateMackine.change(EEntityState.Run)
        return entity
    }

    public createCustomCube1x1(index: number) {

        let entity = this.create<CustomCube1x1Entity>(CBattleCustomCube1x1EntityUrl)
        entity.index = index
        entity.entityStateMackine.change(EEntityState.Load)
        this.scene.cContent.addChild(entity.node)
        entity.entityStateMackine.change(EEntityState.Reset)
        entity.entityStateMackine.change(EEntityState.Run)
        return entity
    }
}//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn打开 http://web3incubators.com/
//电报https://t.me/gamecode999
import { Asset, Prefab } from "cc";
import { IConfigLevelItem } from "../../../app/Config";
import { initData } from "../../../app/GameDefine";
import { Scene } from "../../../scene/script/Scene";
import { BaseModuleEvent, CompleteCallBack, EModuleType, EUILayer, Maths, RandomSeed, TResoucesUrl, _config_, _platform, _prop, _resouces, _scene, _timer, _ui, moduleMgr } from "../Main";
import { EGameType, IGameTypeLogic, gameTypeModule } from "./define/GameTypeDefine";
import { CSceneData, EPropId } from "./define/LogicDefine";



@moduleMgr.add(EModuleType.gameType)
export class GameTypeModule extends BaseModuleEvent {

    public readonly EventType = {
        /**难度飙升动画 */
        PLAY_ANIM: "PLAY_ANIM",
        RESET: "RESET",
        EXIT: "EXIT",
        NEXT: "NEXT",
    }

    public curRandom = new RandomSeed()
    public type = EGameType.none
    public isRun: boolean = false
    public _runComplete = new CompleteCallBack()
    public testSuccess: boolean = false

    public propCount: { [id: number]: number } = {}

    private get scene() { return _scene.getCurrent<Scene>() }

    onCreate(): void {
        gameTypeModule.instance(true)
    }

    public onLogic() {
        // 减临时个数
        _prop.on(_prop.EventType.PROP_SUB, (id: number) => {
            if (this.propCount[id] > 0) {
                this.propCount[id]--
                _prop.emit(_prop.EventType.PROP_CHANGE)
            }
        })
    }

    /**设置免费道具数量 */
    public setPropCount(id: EPropId, count: number) {
        this.propCount[id] = count
        _prop.emit(_prop.EventType.PROP_CHANGE)
    }

    /**
     * 
     * @param randomId 小于0纯随机，反之使用数字
     */
    public logicRun(
        randomId: number,
        createData: () => void,
        complete: (isWin: boolean) => void,
    ) {
        if (randomId === undefined || randomId < 0)
            randomId = Maths.zeroToMax(1000000)
        this.curRandom.init(randomId)
        _platform._record_.start()
        this.isRun = false

        createData()
        this._runComplete.set((isWin: boolean) => {
            _platform._record_.stop()
            this.isRun = false
            _timer.clear(this, this._runCheckComplete)
            complete(isWin)
        })

        this.scene.create()
        _timer.loop(this, this._runCheckComplete, 1, -1, -1)
        this.isRun = true
    }

    public _runCheckComplete(checkIsRun = true) {
        if (checkIsRun)
            if (!this.isRun)
                return

        if (!this.scene.isLoadComplete)
            return

        let module = gameTypeModule.get<IGameTypeLogic>(this.type)
        if (module)
            if (module.checkComplete)
                module.checkComplete()
    }

    public callLaterCheckComplete() {
        _timer.callLater(this, this._runCheckComplete)
    }

    public runComplete(isWin: boolean) {
        this._runComplete.run(isWin)
    }

    public clearRunData() {
        this._runComplete.clear()
        this.testSuccess = false
        this.isRun = false
        _timer.clear(this, this._runCheckComplete)
    }

    public getEnterRunCount(type: EGameType): number {
        return this.storage.get("enterRunCount" + type, 0)
    }

    public run(type: EGameType, ...param: any[]) {
        this.type = type
        this.storage.set("enterRunCount" + this.type, this.getEnterRunCount(this.type) + 1)

        let module = gameTypeModule.get<IGameTypeLogic>(type)
        if (module) {
            if (module.beforeRun)
                module.beforeRun()

            let fn = () => {
                _prop.resetProp()
                for (let config of _config_.arr.prop)
                    this.propCount[config.id] = 0

                module.run(...param)
            }

            let res: TResoucesUrl<Asset>[] = []
            if (module.preLoadRes)
                module.preLoadRes(res)
            if (!_resouces.get(CSceneData.uiUrl.RunUI, Prefab))
                res.push({ type: Prefab, url: CSceneData.uiUrl.RunUI })
            if (res.length > 0) {
                // 首次 首页不打开loading
                if (this.isRun) {
                    _ui.Loading.wait(true)
                    _resouces.loadDir(res, () => {
                        _ui.Loading.wait(false)
                        fn()
                    })
                }
                else
                    _resouces.loadDir(res, fn)
            }
            else
                fn()

        }
    }

    public reset() {
        this.emit(this.EventType.RESET)
        let module = gameTypeModule.get<IGameTypeLogic>(this.type)
        if (module.reset)
            module.reset()
        else
            this.run(this.type)
    }

    public exit() {
        this.emit(this.EventType.EXIT)
        _ui
            .closeAll(EUILayer.Item)
            .closeAll(EUILayer.Panel)
            .closeAll(EUILayer.Notice)
            .closeAll(EUILayer.WindowUp)
            .closeAll(EUILayer.Window)

        this.run(EGameType.index)
    }

    public settingExit() {
        let module = gameTypeModule.get<IGameTypeLogic>(this.type)
        if (module.settingExit)
            module.settingExit()
        else
            this.exit()
    }


    public next(...param: any[]) {
        this.emit(this.EventType.NEXT)
        let module = gameTypeModule.get<IGameTypeLogic>(this.type)
        if (module) {
            if (module.next)
                module.next()
            this.run(this.type, ...param)
        }
    }

    public hasRun(type: EGameType = this.type) {
        let module = gameTypeModule.get<IGameTypeLogic>(type)
        if (!module)
            return true
        if (!module.hasRun)
            return true
        if (module.hasRun())
            return true
        return false
    }


}
import { Asset } from "cc";
import { initData } from "../../../../app/GameDefine";
import { ILevelSelectUIData } from "../../../../scene/script/ui/LevelSelectUI";
import { LevelHelper, Maths, PropHelper, RandomSeed, TResoucesUrl, _config_, _gameType, _logic, _prop, _timer, _ui, winCenterPostion } from "../../Main";
import { EGameType, IGameTypeLogic, gameTypeModule } from "../define/GameTypeDefine";
import { CSceneData, TBattleSizeWight } from "../define/LogicDefine";



@gameTypeModule.add(EGameType.level)
export class LevelGameType implements IGameTypeLogic {

    public level: LevelHelper<null, null> = null!
    public curLevel = -1
    public step: PropHelper = null!

    public get curConfig() {
        return _config_.obj.level_item[this.level.getConverLevel(this.curLevel)]
    }

    constructor() {
        let levelExclude: number[] = []

        let all = Math.floor(_config_.arr.level_item.length / 2)
        for (let i = 0; i < all; i++)
            levelExclude.push(_config_.arr.level_item[i].id)

        this.level = new LevelHelper(
            _gameType.storage,
            -1,
            "level",
            _config_.arr.level_item.length,
            true,
            levelExclude,
            null!
        )

        this.step = new PropHelper(
            _gameType.storage,
            "",
            -1,
            0,
            -1,
            true,
            "step"
        )

        this.step.on(PropHelper.EventType.CHANGE, _gameType.callLaterCheckComplete, _gameType)
    }

    public preLoadRes(res: TResoucesUrl<Asset>[]) {
        res.push(..._logic.preLoadRes)
    }

    public settingExit() {
        _ui.open(CSceneData.uiUrl.LevelSelectUI, <ILevelSelectUIData>{
            level: this.level,
            configLength: _config_.arr.level_item.length,
            add: true,
        })
    }

    public run(level = this.level.cur) {
        this.curLevel = level

        let config = this.curConfig

        _ui.close(CSceneData.uiUrl.LevelSelectUI)
        _ui.close(initData.uiUrl.index)

        _gameType.logicRun(
            this.curLevel,
            () => {
                let widget = <TBattleSizeWight>{}
                for (let i = 0; i < config.widget.length; i++)
                    widget[i as 0] = config.widget[i]

                _logic.create(
                    config.size,
                    widget,
                    true,
                )
            },
            (isWin) => {
                if (isWin) {
                    if (this.level.cur == this.curLevel)
                        this.level.add()
                    _ui.open(CSceneData.uiUrl.SuccessUI)
                }
                else
                    _ui.open(CSceneData.uiUrl.FailUI)
            }
        )

        let configStep = Math.floor(_logic.data.count()) + config.step
        this.step.set(configStep)
        _ui.open(CSceneData.uiUrl.RunUI, null!, () => {
            if (config.anim === 1)
                _gameType.emit(_gameType.EventType.PLAY_ANIM)
        })
    }


    public checkComplete() {
        if (_logic.data.count() == 0) {
            _gameType.runComplete(true)
            return
        }
        if (this.step.cur <= 0)
            _gameType.runComplete(false)
    }

    public reset() {
        _gameType.run(_gameType.type, this.curLevel)
    }

    public subStep() {
        if (_logic.data.count() <= 2)
            if (this.step.cur <= 1) {
                _gameType.isRun = false
            }
        this.step.sub(1)
        _gameType.callLaterCheckComplete()
    }


    public revive() {
        _gameType.isRun = true
        _gameType._runComplete.set(_gameType._runComplete._cb)

        this.step.add(100)
    }

}
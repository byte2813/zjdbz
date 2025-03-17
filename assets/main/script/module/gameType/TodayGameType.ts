import { Asset } from "cc";
import { initData } from "../../../../app/GameDefine";
import { ILevelSelectUIData } from "../../../../scene/script/ui/LevelSelectUI";
import { EUIState, IntervalTimeHelper, LevelHelper, Maths, PropHelper, RandomSeed, TResoucesUrl, Times, Vector2, Vector3, _config_, _gameType, _logic, _login, _main, _platform, _prop, _scene, _timer, _ui, winCenterPostion } from "../../Main";
import { EGameType, IGameTypeLogic, gameTypeModule } from "../define/GameTypeDefine";
import { CBattleSizeEntityUrl, CSceneData, EBattleSizeType, EPropId } from "../define/LogicDefine";
import { Scene } from "../../../../scene/script/Scene";

const v2T = new Vector2()
const v3T = new Vector3()

@gameTypeModule.add(EGameType.today)
export class TodayGameType implements IGameTypeLogic {

    public configIndex: number = 0
    public intervalTimeCountDown: IntervalTimeHelper = null!
    private uiOpenTime: number = 0

    public get curConfig() {
        return _config_.arr.today_item[this.configIndex]
    }

    public get todayTime() { return _logic.storage.get("toDayTime", -1) }
    private get scene() { return _scene.getCurrent<Scene>() }

    constructor() {
        this.intervalTimeCountDown = new IntervalTimeHelper(
            _logic.storage,
            "countDown",
            -1
        )

        let _isVideo = false
        _main.on(_main.EventType.VIDEO_COMPLETE, (isVideo: boolean) => {
            _isVideo = isVideo
        })
        _ui.on(_ui.EventType.OPEN, (url: string) => {
            _isVideo = false
            if (_gameType.type == EGameType.today)
                if (url !== initData.uiUrl.prop)
                    if (url == CSceneData.uiUrl.SettingUI
                        || url == CSceneData.uiUrl.PropGetUI) {
                        this.pause()
                    }
                    else
                        this.uiOpenTime = 0
        })

        _ui.on(_ui.EventType.CLOSE_SCENE_ALL_DELAY, () => {
            if (_gameType.type == EGameType.today)
                if (this.uiOpenTime > 0) {
                    let top = _ui.getTop()
                    if (top == CSceneData.uiUrl.RunUI) {

                        let isAddTime = false
                        if (this.intervalTimeCountDown.sub <= 0) {
                            if (_isVideo)
                                isAddTime = true
                            else
                                _gameType.runComplete(false)
                        }
                        else
                            isAddTime = true

                        if (isAddTime)
                            this.resume()
                    }

                }
        })
    }

    public pause() {
        this.uiOpenTime = Times.second()
        _gameType.isRun = false
    }

    public resume() {
        this.addTime(Times.second() - this.uiOpenTime)
        _gameType.isRun = true
    }

    public preLoadRes(res: TResoucesUrl<Asset>[]) {
        res.push(..._logic.preLoadRes)
    }

    public run() {
        _ui.close(CSceneData.uiUrl.LevelSelectUI)
        _ui.close(initData.uiUrl.index)


        let time = 0
        for (let config of _config_.arr.today_item)
            time += config.time
        this.intervalTimeCountDown.interval = time * 60
        // this.intervalTimeCountDown.interval = 10
        this.intervalTimeCountDown.setCache()
        this.configIndex = 0
        this.uiOpenTime = 0

        // 偷偷加载第二关的资源
        _timer.once(this, () => {
            this.scene.preCube(CBattleSizeEntityUrl[EBattleSizeType["1*1"]], 200, .1)
            _timer.once(this, () => {
                this.scene.preCube(CBattleSizeEntityUrl[EBattleSizeType["1*2"]], 200, .1)
                _timer.once(this, () => {
                    this.scene.preCube(CBattleSizeEntityUrl[EBattleSizeType["1*2"]], 200, .1)
                }, 200 * .1)
            }, 200 * .1)
        }, 3)

        let fn = () => {
            this._run(() => {
                if (this.configIndex >= _config_.arr.today_item.length - 1) {
                    let curTime = this.intervalTimeCountDown.interval - this.intervalTimeCountDown.sub
                    if (this.todayTime == -1 || this.todayTime > curTime)
                        _logic.storage.set("toDayTime", curTime)
                    _logic.storage.set("toDayRunComplete", "true")
                    _ui.open(CSceneData.uiUrl.SuccessToDayUI, curTime)
                    return
                }
                this.configIndex++
                _timer.callLater(this, fn)
            })
        }
        fn()
    }

    public addTime(duration: number) {
        this.intervalTimeCountDown.interval += duration
        _logic.emit(_logic.EventType.DURATION_CHANGE)
    }

    private _run(success: () => void) {
        let config = this.curConfig

        let id = -1
        if (_login.isNewUser && initData.newUseEnterGame)
            id = 10000000 - 12325
        _gameType.logicRun(
            id,
            () => {
                if (config.id == 1)
                    _logic.create(
                        config.size,
                        {
                            [EBattleSizeType["1*1"]]: 100,
                            [EBattleSizeType["1*2"]]: 0,
                            [EBattleSizeType["2*2"]]: 0,
                        },
                        false
                    )
                else
                    _logic.create(
                        config.size,
                        {
                            [EBattleSizeType["1*1"]]: 100,
                            [EBattleSizeType["1*2"]]: 0,
                            [EBattleSizeType["2*2"]]: 0,
                        },
                        true,
                        undefined,
                        {
                            position: v3T.set(24, 20, 24).mulSelf(12 / 10),
                            dis: v2T.set(4, 40).mulSelf(12 / 12),
                        },
                    )
            },
            (isWin) => {
                if (isWin)
                    success()
                else
                    _ui.open(CSceneData.uiUrl.FailUI)
            }
        )
        _ui.open(CSceneData.uiUrl.RunUI, null, () => {
            if (config.anim === 1)
                _gameType.emit(_gameType.EventType.PLAY_ANIM)
        })
    }

    public checkComplete() {
        if (_logic.data.count() == 0) {
            _gameType.runComplete(true)
            return
        }
        let state = _ui.getModule(CSceneData.uiUrl.PropGetUI).state
        if (!(state == EUIState.Open
            || state == EUIState.Load))
            if (this.intervalTimeCountDown.sub <= 0) {
                let state = _ui.getModule(CSceneData.uiUrl.PropGetUI).state
                if (state == EUIState.Open || state == EUIState.Load)
                    return
                if (_prop.hasToDayMax(EPropId.time))
                    _gameType.runComplete(false)
                else
                    _prop.openGetUI(_prop.singles.get(EPropId.time))
            }
    }


    public revive(addTime: number) {
        _gameType.isRun = true
        _gameType._runComplete.set(_gameType._runComplete._cb)
        this.addTime(5 * 60 + addTime)
    }

}
import { Asset } from "cc";
import { Maths, RandomSeed, TResoucesUrl, Vector3, _config_, _gameType, _logic, _ui } from "../../Main";
import { EGameType, IGameTypeLogic, gameTypeModule } from "../define/GameTypeDefine";
import { EBattleSizeType } from "../define/LogicDefine";
import { initData } from "../../../../app/GameDefine";

const size = new Vector3(2, 2, 2)


@gameTypeModule.add(EGameType.index)
export class IndexGameType implements IGameTypeLogic {

    public preLoadRes(res: TResoucesUrl<Asset>[]) {
        res.push(..._logic.preLoadRes)
    }

    public run(...param: any[]) {
        _gameType.logicRun(
            Maths.minToMax(0, 100000),
            () => {
                _logic.create(
                    size,
                    {
                        [EBattleSizeType["1*1"]]: 100,
                        [EBattleSizeType["1*2"]]: 0,
                        [EBattleSizeType["2*2"]]: 0,
                    },
                    false,
                )
            },
            (isWin) => {

            }
        )
        _gameType.isRun = false
        _ui.open(initData.uiUrl.index)
    }

}
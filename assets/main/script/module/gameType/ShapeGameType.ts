import { Asset, Color, Material, Prefab, Texture2D } from "cc";
import { initData } from "../../../../app/GameDefine";
import { ILevelSelectUIData } from "../../../../scene/script/ui/LevelSelectUI";
import { LevelHelper, Maths, PropHelper, RandomSeed, TResoucesUrl, Vector2, Vector3, _config_, _gameType, _logic, _prop, _resouces, _timer, _ui, winCenterPostion } from "../../Main";
import { EGameType, IGameTypeLogic, gameTypeModule } from "../define/GameTypeDefine";
import { CBattleShapeConfigColor, CBattleShapeConfigLevel, CBattleSizeEntityUrl1x1Shape, CBattleSizeEntityUrl1x1ShapeMatBlackImg, CBattleSizeEntityUrl1x1ShapeMatColor, CBattleSizeEntityUrl1x1ShapeMatWhiteImg, CCubeSize, CSceneData, EBattleSizeType, IBattleShapeMat, TBattleSizeWight } from "../define/LogicDefine";

const colorT = new Color()
const v3T = new Vector3()
const shapePosT = new Vector3(0, 0, 70)
const shapeRotateT = new Vector3()
const v2T = new Vector2()


@gameTypeModule.add(EGameType.shape)
export class ShapeGameType implements IGameTypeLogic {

    public level: LevelHelper<null, null> = null!
    public curLevel = -1

    public data: {
        level: { x: number[], y: number[], c: number[] }[],
        color: { r: number[], g: number[], b: number[] },
        curColors: number[],
        matMap: { [id: string]: IBattleShapeMat },
        colorMat: Material,
        blackTexture: Texture2D,
        whiteTexture: Texture2D,
        imgBlackMat: Material,
        imgWhiteMat: Material,
    } = null!

    public get curConfig() {
        return _config_.obj.level_item[this.level.getConverLevel(this.curLevel)]
    }

    constructor() {
        this.level = new LevelHelper(
            _gameType.storage,
            -1,
            "shapeLevel",
            30,
            false,
            [],
            null!
        )
    }

    public preLoadRes(res: TResoucesUrl<Asset>[]) {
        res.push(..._logic.preLoadRes)
        if (!this.data) {
            res.push(
                { url: CBattleSizeEntityUrl1x1Shape, type: Prefab },
                { url: CSceneData.uiUrl.RunUI, type: Prefab },
                CBattleShapeConfigColor,
                CBattleShapeConfigLevel,
                CBattleSizeEntityUrl1x1ShapeMatColor,
                CBattleSizeEntityUrl1x1ShapeMatBlackImg,
                CBattleSizeEntityUrl1x1ShapeMatWhiteImg,
            )
        }
    }


    public run(level = this.level.cur) {
        this.curLevel = level
        if (!this.data) {
            this.data = {
                level: _resouces.get(CBattleShapeConfigLevel).json as any,
                color: _resouces.get(CBattleShapeConfigColor).json as any,
                matMap: {},
                curColors: [],
                colorMat: _resouces.get(CBattleSizeEntityUrl1x1ShapeMatColor),
                imgBlackMat: _resouces.get(CBattleSizeEntityUrl1x1ShapeMatBlackImg),
                imgWhiteMat: _resouces.get(CBattleSizeEntityUrl1x1ShapeMatWhiteImg),
                blackTexture: _resouces.get({ url: "scene/texture/black/texture", type: Texture2D }),
                whiteTexture: _resouces.get({ url: "scene/texture/white/texture", type: Texture2D }),
            }
        }

        let config = this.curConfig

        _ui.close(CSceneData.uiUrl.LevelSelectUI)
        _ui.close(initData.uiUrl.index)

        _gameType.logicRun(
            this.curLevel,
            () => {
                this.data.curColors.length = 0

                let configData = this.data.level[level - 1]

                let maxX = 0
                let maxY = 0

                for (let i = 0; i < configData.x.length; i++) {
                    let x = configData.x[i],
                        y = configData.y[i]
                    if (x > maxX)
                        maxX = x
                    if (y > maxY)
                        maxY = y

                    let colorId = configData.c[i]
                    this.data.curColors.push(colorId)
                    if (!this.data.matMap[colorId]) {
                        let num = 255 / 2
                        let orginImgMat: Material = null!
                        let orginTexture: Texture2D = null!
                        let color = this.data.color
                        colorT.set(color.r[colorId], color.g[colorId], color.b[colorId], 255)
                        if (colorT.r > num
                            || colorT.g > num
                            || colorT.b > num
                        ) {
                            orginTexture = this.data.blackTexture
                            orginImgMat = this.data.imgBlackMat
                        }
                        else {
                            orginTexture = this.data.whiteTexture
                            orginImgMat = this.data.imgWhiteMat
                        }

                        let colorMat = new Material()
                        colorMat.initialize({
                            effectAsset: this.data.colorMat.effectAsset,
                            defines: { USE_INSTANCING: true, USE_TEXTURE: false },
                        })
                        colorMat.setProperty("mainColor", colorT)

                        let imgMat = new Material()
                        imgMat.initialize({
                            effectAsset: orginImgMat.effectAsset,
                            defines: { USE_INSTANCING: true, USE_TEXTURE: true },
                        })
                        imgMat.setProperty("mainColor", colorT)
                        imgMat.setProperty("mainTexture", orginTexture)

                        this.data.matMap[colorId] = {
                            color: colorMat,
                            img: imgMat,
                        }
                    }
                }

                let offset = Vector3.pool.get()
                    .set(
                        -(maxX / 2 + CCubeSize.x),
                        -(maxY / 2 + CCubeSize.y),
                        -(CCubeSize.z)
                    )

                _logic.create(
                    v3T.set(maxX, maxY, 1),
                    {
                        [EBattleSizeType["1*1"]]: 100,
                        [EBattleSizeType["1*2"]]: 0,
                        [EBattleSizeType["2*2"]]: 0,
                    },
                    false,
                    () => {
                        for (let i = 0; i < configData.x.length; i++) {
                            let x = configData.x[i],
                                y = configData.y[i]
                            _logic.data.datas.push(_logic.create1x1(v3T.set(x, y, 0), offset))
                        }

                        Vector3.pool.put(offset)
                    },
                    {
                        position: shapePosT,
                        dis: v2T.set(4, 100),
                        rotate: shapeRotateT,
                    },
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
    }

    public reset() {
        _gameType.run(_gameType.type, this.curLevel)
    }


    public settingExit() {
        _ui.open(CSceneData.uiUrl.LevelSelectUI, <ILevelSelectUIData>{
            level: this.level,
            configLength: this.level.max,
        })
    }

}
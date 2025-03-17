import { JsonAsset, Material, Size, Vec3, ccenum, geometry } from "cc"
import { CubeEntity } from "../../../../scene/script/entity/CubeEntity"
import { Circle, IVector3, Maths, Rectangle, TResoucesUrl, Vector2, Vector3 } from "../../Main"
import { CustomDownEntity } from "../../../../scene/script/entity/CustomDownEntity"
import { CustomCube1x1Entity } from "../../../../scene/script/entity/CustomCube1x1Entity"

export enum EEntityType {
    None,
    Cube,
    CustomDown,
    CustomCube1x1,
}

export enum EPropId {
    tip = 1,
    remove = 2,
    back = 3,
    reset = 4,
    time = 7,
    /**体力 */
    power = 8,
    
}
ccenum(EPropId)


/**房间加载的优先级排序 越前越先加载*/
export const CResoucesLoadPriority: EEntityType[] = [

]


export interface ILogicData {
    type: EBattleSizeType,
    /**占据 2x2x2的 1x1x1的格子 */
    positions: Vector3[],
    // 占据 2x2x2的 世界坐标
    center: Vector3,
    /**占据 2x2x2的 索引中心点 */
    indexCenter: Vector3,
    dir: EBattleDirType
    entity: CubeEntity
    customDownEntity: CustomDownEntity
    customCube1x1Entity: CustomCube1x1Entity
    aabb: geometry.AABB
    frontIndex?: number
}

/**
 * 正视立方体
 *             up
 * front left back right 
 *            down
 */
export enum EBattleDirType {
    /** +y */
    up,
    /** -y */
    down,
    /** +z */
    front,
    /** -x */
    left,
    /** -z */
    back,
    /** +x */
    right,
}

/**反向 */
export const CBattleDirBack: { [type in `${EBattleDirType}`]: EBattleDirType } = {
    [EBattleDirType.up]: EBattleDirType.down,
    [EBattleDirType.down]: EBattleDirType.up,
    [EBattleDirType.front]: EBattleDirType.back,
    [EBattleDirType.left]: EBattleDirType.right,
    [EBattleDirType.back]: EBattleDirType.front,
    [EBattleDirType.right]: EBattleDirType.left,
}

export const CBattleDirAngle: { [type in `${EBattleDirType}`]: Vector3 } = {
    [EBattleDirType.up]: new Vector3(),
    [EBattleDirType.down]: new Vector3(180),
    [EBattleDirType.front]: new Vector3(90),
    [EBattleDirType.left]: new Vector3(0, 0, 90),
    [EBattleDirType.back]: new Vector3(-90),
    [EBattleDirType.right]: new Vector3(0, 0, -90),
}

export const CBattleDirAngleFn: { [type in `${EBattleDirType}`]: (v: IVector3) => Vec3 } = {
    [EBattleDirType.up]: v => v as Vec3,
    [EBattleDirType.down]: v => Vector3.rotateX(v, v, Vector3.ZERO, 180) as Vec3,
    [EBattleDirType.front]: v => Vector3.rotateX(v, v, Vector3.ZERO, 90) as Vec3,
    [EBattleDirType.left]: v => Vector3.rotateZ(v, v, Vector3.ZERO, 90) as Vec3,
    [EBattleDirType.back]: v => Vector3.rotateX(v, v, Vector3.ZERO, - 90) as Vec3,
    [EBattleDirType.right]: v => Vector3.rotateZ(v, v, Vector3.ZERO, - 90) as Vec3,
}

export const CBattleDirV3: { [type in `${EBattleDirType}`]: Vector3 } = {
    [EBattleDirType.up]: new Vector3(0, 1, 0),
    [EBattleDirType.down]: new Vector3(0, -1, 0),
    [EBattleDirType.front]: new Vector3(0, 0, 1),
    [EBattleDirType.left]: new Vector3(-1, 0, 0),
    [EBattleDirType.back]: new Vector3(0, 0, -1),
    [EBattleDirType.right]: new Vector3(1, 0, 0),
}

export const CBattleDirXYZ: { [type in `${EBattleDirType}`]: { cur: "x" | "y" | "z", other: ("x" | "y" | "z")[] } } = {
    [EBattleDirType.up]: { cur: "y", other: ["x", "z"] },
    [EBattleDirType.down]: { cur: "y", other: ["x", "z"] },
    [EBattleDirType.front]: { cur: "z", other: ["x", "y"] },
    [EBattleDirType.left]: { cur: "x", other: ["z", "y"] },
    [EBattleDirType.back]: { cur: "z", other: ["x", "y"] },
    [EBattleDirType.right]: { cur: "x", other: ["z", "y"] },
}

/**为2的边对应的方向 */
export const CBattleDirs = {
    x: [EBattleDirType.left, EBattleDirType.right],
    y: [EBattleDirType.up, EBattleDirType.down],
    z: [EBattleDirType.front, EBattleDirType.back],
}

export const CBattle2x2Dir2 = [
    EBattleDirType.left,
    EBattleDirType.up,
    EBattleDirType.front,
]

/**格子类型 */
export enum EBattleSizeType {
    "1*1",
    "1*2",
    "2*2",
}

export const CBattleSizeEntityUrl: { [type in `${EBattleSizeType}`]: string } = {
    [EBattleSizeType["1*1"]]: "scene/prefab/entity/Cube1x1Entity",
    [EBattleSizeType["1*2"]]: "scene/prefab/entity/Cube1x2Entity",
    [EBattleSizeType["2*2"]]: "scene/prefab/entity/Cube2x2Entity",
}


export const CBattleShapeConfigColor: TResoucesUrl<JsonAsset> = { url: "scene/config/pixelcolor", type: JsonAsset }
export const CBattleShapeConfigLevel: TResoucesUrl<JsonAsset> = { url: "scene/config/pixellevel", type: JsonAsset }

export const CBattleSizeEntityUrl1x1Shape = "scene/prefab/entity/Cube1x1ShapeEntity"
export const CBattleSizeEntityUrl1x1ShapeMatBlackImg: TResoucesUrl<Material> = { url: "scene/material/cube/1x1_shape/imgBlack", type: Material, }
export const CBattleSizeEntityUrl1x1ShapeMatWhiteImg: TResoucesUrl<Material> = { url: "scene/material/cube/1x1_shape/imgWhite", type: Material, }
export const CBattleSizeEntityUrl1x1ShapeMatColor: TResoucesUrl<Material> = { url: "scene/material/cube/1x1_shape/color", type: Material, }

export const CBattleCustomDownEntityUrl = "scene/prefab/entity/CustomDownEntity"
export const CBattleCustomCube1x1EntityUrl = "scene/prefab/entity/CustomCube1x1Entity"

export const CBattleSizeTypeImgNames: { [type in `${EBattleSizeType}`]: string[] } = {
    [EBattleSizeType["1*1"]]: [
        "1X1/up",
        "1X1/down",
        "1X1/front",
        "1X1/left",
        "1X1/back",
        "1X1/right",
    ],
    [EBattleSizeType["1*2"]]: [
        "1X1/up",
        "1X1/down",
        "1X2/front",
        "1X2/left",
        "1X2/back",
        "1X2/right",
    ],
    [EBattleSizeType["2*2"]]: [
        "2X2/up",
        "2X2/down",
        "2X2/front",
        "2X2/left",
        "2X2/back",
        "2X2/right",
    ],
}



export const CBattleImgNames = [
    ...CBattleSizeTypeImgNames[EBattleSizeType["1*1"]],
    ...CBattleSizeTypeImgNames[EBattleSizeType["1*2"]],
    ...CBattleSizeTypeImgNames[EBattleSizeType["2*2"]],
]



/**格子类型权重 */
export type TBattleSizeWight = { [type in `${EBattleSizeType}`]: number }

export const CXyzTemp = ["x", "y", "z"]
export const CCubeSize = new Vector3(.5, .5, .5)
export const CCubeSizeAddV3 = new Vec3(.1, .1, .1)
export const CCubeColliderDis = .5

export interface IBattleCustom {
    downs: ILogicData[]
    datas: ILogicData[]
    all: ILogicData[]
    dataByPos: number[]
    /**true创建 false删除 */
    state: boolean
}

export interface IBattleShapeMat {
    color: Material,
    img: Material,
}

export const CBattleCustomSize = new Vec3(10, 10, 10)
export const CBattleCustomDefaultMapCount = 5
export const CBattleCustomDefaultCubeCount = 30
export const CBattleCustomVidoCubeCount = 50
export const CBattleCustomOpenByLevel = 5

export interface IBattleCustomCacheData {
    /**创建的时间 */
    createTime: number
    /**更新的时间 */
    updateTime: number
    /**分享出去的数据 */
    data: IBattleCustomCacheDataShare

}

export interface IBattleCustomCacheDataShare {
    /**最大步数 */
    t: number
    /**位置数据 */
    p: number[]
    /**皮肤id */
    s: number
}


export const CBattleToDayOnceSphere = [
    new Vector3(0, 1, 0),
    new Vector3(-1, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1),
    new Vector3(0, -1, 0),
]

export enum EShareDayType {
    runTip,
    customTip,
}

export const CSceneData = {
    shareDay: {
        [EShareDayType.runTip]: 2,
        [EShareDayType.customTip]: 1
    },


    dotPrefabUrl: "scene/prefab/entity/DotEntity",
    tipPrefabUrl: "scene/prefab/entity/TipEntity",
    moveFishPrefabUrl: "scene/prefab/entity/MoveFishEntity",
    fishDownPrefabUrl: "scene/prefab/entity/FishDownEntity",
    customFishPrefabUrl: "scene/prefab/entity/CustomFishEntity",

    CustomListUIItemFish: "scene/prefab/ui/CustomListUIItemFish",

    audio: {
        bgm: "sceneRes/audio/bgm",
        success: "sceneRes/audio/success",
        fail: "sceneRes/audio/fail",
        magic: "sceneRes/audio/magic",
        remove: "sceneRes/audio/remove",
    },

    uiUrl: {
        SettingUI: "setting/prefab/SettingUI",
        SkinUI: "skin/prefab/SkinUI",
        PropGetUI: "scene/prefab/ui/PropGetUI",
        FailUI: "scene/prefab/ui/FailUI",
        LevelSelectUI: "scene/prefab/ui/LevelSelectUI",
        SuccessUI: "scene/prefab/ui/" + (false ? "SuccessNativeUI" : "SuccessUI"),
        RunUI: "scene/prefab/ui/RunUI",

        SuccessToDayUI: "scene/prefab/ui/SuccessToDayUI",
        ToDayPropUI: "scene/prefab/ui/ToDayPropUI",
        CustomFriendUI: "scene/prefab/ui/CustomFriendUI",
        CustomEditorSuccessUI: "scene/prefab/ui/CustomEditorSuccessUI",
    },

}



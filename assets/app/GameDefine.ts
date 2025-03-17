
import { ConfigFileName, TConfigFileName } from "./Config";
import { LanguageDefineConfig } from "./LanguageDefineConfig";
import "./CCImport"
import { sys } from "cc";
import { OPPO, VIVO, WECHAT } from "cc/env";

type TPlatformType = keyof typeof apeng.EPlatformType

/**平台 */
let platformType: TPlatformType = "web"
// 自动判断平台
if (window["wx"])
    platformType = "wx"
if (window["qq"])
    platformType = "qq"
if (window["tt"])
    platformType = "tt"
if (OPPO)
    platformType = "oppo"
if (VIVO)
    platformType = "vivo"


/**默认语言 */
const defaultType: keyof typeof apeng.ELanguageType = "chinese"
const chinaLanguage = (defaultType as any) == "chinese"

export const initData: apeng.IInitData = {
    gameName: "箭头消消",
    server: {
        gameId: "",
        requestIp: "",
    },
    isWaitScene: true,
    configPlatform: "platform",
    rewardVideoUseShare: false,
    isTest: true,
    isLog: true,
    platformType,
    useModuleStorageType: true,
    openWebSimulationUI: true,
    useWebSimulationUI: false,
    openPrivacy: (<TPlatformType[]>[
        // "web",
        "qq",
        "vivo",
        "oppo",
    ]).indexOf(platformType) !== -1 && chinaLanguage,
    showLoadingText: (<TPlatformType[]>[
        "web",
        "wx",
        "tt",
        "oppo",
        "vivo",
        "ks",
        "xiaomi",
        "hbs",
        "qq",
    ]).indexOf(platformType) !== -1 && chinaLanguage,
    versionId: "2023SA0049994",
    openGm: false,
    loadingCompleteColorAnim: "#FEFDE7",
    initSceneUrl: "scene/scene/Scene",
    audioClickUrl: "main/audio/click_sound",
    configUrl: "config/configs",
    touchMovePrefabUrl: "main/particle/7/prefab",
    touchClickPrefabUrl: "main/particle/1/prefab",
    sceneChangeWaitUrl: "",
    uiUrl: {
        index: "main/prefab/index/IndexUI",
        indexBg: "main/prefab/index/IndexBgUI",
        prop: "",
        sidebar: "",
    },
    startBlockAd: 0,
    share: {
        callTime: 0,
        list: {
            title: [
                "一口气玩了20关，根本停不下来。",
                "@你，这是一款超难消除游戏",
                "超还上头的消除游戏，来冲吧",
                "不通关谁都别睡觉！",
            ],
            imgUrl: [],
        },
        templateId: [],
    },
    newUseEnterGame: (<TPlatformType[]>[
        "qq",
    ]).indexOf(platformType) === -1,
    loadingDuration: 0,
    configDefine: ConfigFileName,
    languageDefine: LanguageDefineConfig,
    getLanguageType: () => {
        let value = sys.localStorage.getItem("language")
        if (value === null || value === "null" || value === undefined || value === "")
            return defaultType
        let type = Number(value)
        if (isNaN(type))
            return defaultType
        return defaultType
    },
}

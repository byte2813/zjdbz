import { IConfigBase, IConfigCountryItem, IConfigItemBase, IConfigLanguage, IConfigPlatform, IConfigProp, IConfigProvinceItem, IConfigSkinBase } from "../main/script/Main"


export const ConfigFileName = {
    main: <any>"value",
    platform: <IConfigPlatform>null!,
    language: <IConfigLanguage>null!,
    prop: <IConfigProp>null!,
    province_item: <IConfigProvinceItem>null!,
    level_item: <IConfigLevelItem>null!,
    today_item: <IConfigToDayItem>null!,
    skin_item: <IConfigFishSkin>null!,
}

export type TConfigFileName = typeof ConfigFileName

export interface IConfigFishSkin extends IConfigSkinBase {
    scene_url: string
}

export interface IConfigToDayItem extends IConfigLevelItem {
    /**单个时间（累加总时间（分）） */
    time: number
}

export interface IConfigLevelBase extends IConfigBase {
    /**大小(x;y) */
    size: number[]
    /**1播放难度飙升动画 */
    anim: 0 | 1
    /**1播放新手引导手指提示 */
    tip: 0 | 1
    /**随机种子（默认使用关卡id随机， 大于0，当前数字随机，等于0关卡id随机，小于0纯随机） */
    seed_id: number,
    /**出现的格子比率（1x1x1;1x2x1;2x2x1） */
    widget: number[]
    /**通过步数 */
    step: number
}


export interface IConfigLevelItem extends IConfigLevelBase {
    /**随机删减比率 */
    removeRatio: number,
    /**相邻相对的 最大个数，默认纯随机 */
    bug_count: number,
    /**最小缩放值 默认 0.5*/
    scaleMin: number
}
import { ccclass, BaseUI, EUILayer, EBlockOnceAdType, EPlatformType, EBottomAdType } from "../../../main/script/Main"

;




@ccclass("CustomFriendUI")
export class CustomFriendUI extends BaseUI {
    public layerType = EUILayer.ItemUp
    public blockOnceAdType = EBlockOnceAdType.Show

    public _openData: IBattleCustomCacheDataShare = null!

    protected onCreate(): void {
        switch (PlatformMgr.type) {
            case EPlatformType.WECHAT:
                this.bottomAdType = EBottomAdType.Native
                break
            default:
                this.bottomAdType = EBottomAdType.Banner
                break
        }
    }


    private onClickBtn() {
        this.closeUI()
        _battleCustom.run(this._openData, true)
    }

}

import { Label } from "cc"
import { ccclass, BaseUI, EUILayer, EBlockOnceAdType, EPlatformType, EBottomAdType, _main } from "../../../main/script/Main"




@ccclass("CustomMapUI")
export class CustomMapUI extends BaseUI {
    public layerType = EUILayer.Panel
    public blockOnceAdType = EBlockOnceAdType.None

    private cLabel_video_count: Label = null!
    private cVideoIcon: Node = null!

    protected onCreate(): void {
        switch (PlatformMgr.type) {
            case EPlatformType.WECHAT:
                this.bottomAdType = EBottomAdType.Native
                break
            default:
                this.bottomAdType = EBottomAdType.Banner
                break
        }
        this.addEvent(_battleCustom.EventType.MAP_COUNT_CHANGE, this.onOpen, this, _battleCustom)

        this.SwitchSpriteCC.index = CUseUIIndex == 0 ? 0 : 1
    }

    protected onOpen(): void {
        let curCount = _battleCustom.getMapCount()
        this.cLabel_video_count.string = curCount + "/" + CBattleCustomDefaultMapCount
        this.ListCC.render(curCount, BattleCustomMapUIItem, (comp, data, index) => {
            comp.init(index)
        })

        this.cVideoIcon.active = curCount >= CBattleCustomDefaultMapCount
    }

    private onClickVideo() {
        let curCount = _battleCustom.getMapCount()
        let complete = () => {
            this.closeUI()
            UIMgr.tip("新建地图成功")
            let index = _battleCustom.addMap()
            _battleCustom.editorRun(index)
        }
        if (curCount >= CBattleCustomDefaultMapCount) {
            _main.showVideo("自定义地图", complete)
        }
        else
            complete()
    }

    private onClickExit() {
        this.closeUI()
        _battle.exit(true)
    }
}

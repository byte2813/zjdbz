import { Label } from "cc"
import { ccclass, EBlockOnceAdType, EPlatformType, EBottomAdType, _main } from "../../../main/script/Main"
import { AnimBaseUI } from "../../../main/script/ui/AnimBaseUI"




@ccclass("CustomEditorUI")
export class CustomEditorUI extends AnimBaseUI {
    public blockOnceAdType = EBlockOnceAdType.None

    private cLabel_step: Label = null!
    private cLabel_title: Label = null!

    protected onCreate(): void {
        switch (PlatformMgr.type) {
            case EPlatformType.WECHAT:
                this.bottomAdType = EBottomAdType.Native
                break
            default:
                this.bottomAdType = EBottomAdType.Banner
                break
        }
        this.addEvent(_battleCustom.EventType.MAP_DATA_CHANGE, this.updateStep, this, _battleCustom)
    }

    protected onOpen(): void {
        this.cLabel_title.string = "我的地图" + (_battleCustom.editorIndex + 1)
        this.updateStep()
        this.updateCubeState()
    }

    private updateStep() {
        this.cLabel_step.string = _battleCustom.getStepSub(_battleCustom.editorIndex) + ""
    }

	private onClickPause() {
		UIMgr.open(CUseData.settingUrl)
	}

    private onClickCubeState() {
        _battleCustom.data.state = !_battleCustom.data.state
        this.updateCubeState()
    }

    private updateCubeState() {
        this.SwitchSpriteCC.index = _battleCustom.data.state ? 0 : 1
    }

    private onClickAddStep() {
        _main.showVideo("自定义关卡加步数", () => {
            _battleCustom.addMapCubeCount(_battleCustom.editorIndex)
        })
    }

    private onClickRun() {
        _battleCustom.run(_battleCustom.getMap(_battleCustom.editorIndex).data, false)
    }

    private onClickAShare() {
        _battleCustom.shareMap(_battleCustom.editorIndex)
    }


}

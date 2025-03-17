import { ccclass, BaseUI, EUILayer, EBlockOnceAdType, EPlatformType, EBottomAdType, _platform, _audio, _logicCustom } from "../../../main/script/Main"
import { CSceneData } from "../../../main/script/module/define/LogicDefine"




@ccclass("CustomEditorSuccessUI")
export class CustomEditorSuccessUI extends BaseUI {
    public layerType = EUILayer.Notice
    public blockOnceAdType = EBlockOnceAdType.Show

    protected openByAudioUrls = [
        CSceneData.audio.success,
    ]

    protected onCreate(): void {
        switch (_platform.type) {
            case EPlatformType.wx:
                this.bottomAdType = EBottomAdType.Native
                break
            default:
                this.bottomAdType = EBottomAdType.Banner
                break
        }
    }

    protected onOpen(): void {
        _audio.play(this.audioUrls[0])
    }

    private onClickAShare() {
        _logicCustom.shareMap(_logicCustom.editorIndex)
    }

    private onClickBack() {
        this.closeUI()
        // _logicCustom.editorRun(_logicCustom.editorIndex)
    }

}

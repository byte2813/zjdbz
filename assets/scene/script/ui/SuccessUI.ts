import { Label, Node } from "cc";
import { ccclass, BaseUI, EUILayer, EBlockOnceAdType, EPlatformType, EBottomAdType, NodeHelper, _language, _main, ButtonCC, _platform, ELanguageType, _audio, _ui, Times, _gameType } from "../../../main/script/Main";
import { ToDayMaxRecode } from "../../../main/script/ui/ToDayMaxRecode";
import { initData } from "../../../app/GameDefine";
import { EGameType } from "../../../main/script/module/define/GameTypeDefine";
import { CSceneData } from "../../../main/script/module/define/LogicDefine";




@ccclass("SuccessUI")
export class SuccessUI extends BaseUI {
	public layerType = EUILayer.Notice
	public blockOnceAdType = EBlockOnceAdType.Show

	private cAShare: Node = null!
	private cButtonCCNext: ButtonCC = null!
	private cBtns: Node = null!
	private cNativeHight: Node = null!

	protected openByAudioUrls = [
		CSceneData.audio.success,
	]

	protected get toDayMaxRecode() { return this.getCacheComponent("ToDayMaxRecode") as ToDayMaxRecode }

	protected onCreate(): void {
		switch (_platform.type) {
			case EPlatformType.vivo:
				this.bottomAdType = EBottomAdType.Native
				break
			case EPlatformType.oppo:
				if (_platform.isLongScreen)
					this.bottomAdType = EBottomAdType.Banner
				else
					this.bottomAdType = EBottomAdType.None
				break
			case EPlatformType.wx:
				this.bottomAdType = EBottomAdType.Native
				break
			default:
				this.bottomAdType = EBottomAdType.Banner
				break
		}
	}

	onOpen() {
		if (_platform.type == EPlatformType.oppo)
			_platform._nativeTemp_.showRoot()
		else
			if (this.bottomAdType == EBottomAdType.Banner)
				NodeHelper.setPositionY(this.cBtns, _platform._banner_.worldTopY, true)
			else {

			}

		if (this.cNativeHight)
			if (_platform.type == EPlatformType.oppo)
				NodeHelper.setSize(this.cNativeHight, 0, 520)
			else if (_platform.type == EPlatformType.vivo)
				NodeHelper.setSize(this.cNativeHight, 0, 690)

		if (_language.cur == ELanguageType.chinese) {
			if (this.cAShare)
				this.cAShare.active = true
			this.cButtonCCNext.isPlayBreathe = false
		}
		else {
			if (this.cAShare)
				this.cAShare.active = false
			this.cButtonCCNext.isPlayBreathe = true
		}

		_audio.play(this.audioUrls[0])
		switch (_gameType.type) {
			case EGameType.level:
				this.cButtonCCNext.node.active = true
				this.toDayMaxRecode.node.active = false
				break;
			case EGameType.today:
				this.cButtonCCNext.node.active = false
				this.toDayMaxRecode.node.active = true
				break;
		}


		if (_platform.type == EPlatformType.overseas_kwai)
			_platform._interstitial_.show()

	}


	private onClickIndex() {
		this.closeUI()
		_gameType.exit()

		if (_platform.type == EPlatformType.oppo)
			_platform._nativeTemp_.hideRoot()
	}

	private onClickNext() {
		if (_gameType.hasRun()) {
			this.closeUI()
			_gameType.next()
		}
	}


	private onClickAShare() {
		_main.showVideo("好友自创通关分享", () => {
			_ui.tip(_language.get(40004))
		}, true)
	}
}

import { Label, Node } from "cc";
import { ccclass, BaseUI, EUILayer, EBlockOnceAdType, EPlatformType, EBottomAdType, NodeHelper, _language, _main, ButtonCC, _platform, ELanguageType, _audio, _ui, Times, _gameType, _logic, Sets, _config_ } from "../../../main/script/Main";
import { ToDayMaxRecode } from "../../../main/script/ui/ToDayMaxRecode";
import { initData } from "../../../app/GameDefine";
import { EGameType } from "../../../main/script/module/define/GameTypeDefine";
import { CSceneData } from "../../../main/script/module/define/LogicDefine";




@ccclass("SuccessToDayUI")
export class SuccessToDayUI extends BaseUI {
	public layerType = EUILayer.Notice
	public blockOnceAdType = EBlockOnceAdType.Show

	private cAShare: Node = null!

	private cASkin: Node = null!
	private cLabel_cur_time: Label = null!
	private cShare: Node = null!

	public _openData: number = null!

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


		_audio.play(this.audioUrls[0])

		if (_platform.type == EPlatformType.overseas_kwai)
			_platform._interstitial_.show()

		this.cLabel_cur_time.string = Times.numHourCountDown(this._openData * 1000)

		// 奖励皮肤
		let noUnlocks = _logic.arrowSkin.noUnlocks
		if (noUnlocks.length > 0) {


			this.cASkin.active = true
			let id = Sets.random(noUnlocks)
			this.SpriteLoaderCC.setSpriteFrameUrl(_config_.obj.skin_item[id].icon_url, true)

			_logic.arrowSkin.unlock(id)
		}
		else {
			this.cASkin.active = false
		}
	}


	private onClickIndex() {
		this.closeUI()
		_gameType.exit()

		if (_platform.type == EPlatformType.oppo)
			_platform._nativeTemp_.hideRoot()
	}


	private onClickAShare() {
		_main.showVideo("好友自创通关分享", () => {
			_ui.tip(_language.get(40004))
		}, true)
	}
}

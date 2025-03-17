import { Node } from "cc";
import { ccclass, BaseUI, EUILayer, EBlockOnceAdType, EPlatformType, EBottomAdType, NodeHelper, Times, _main, _language, SpriteLoaderCC, _platform, _audio, _ui, _gameType, _logic } from "../../../main/script/Main";
import { ToDayMaxRecode } from "../../../main/script/ui/ToDayMaxRecode";
import { EGameType } from "../../../main/script/module/define/GameTypeDefine";
import { initData } from "../../../app/GameDefine";
import { CSceneData } from "../../../main/script/module/define/LogicDefine";


const tipName = [
	"sffh",
	"test2222",
]

@ccclass("FailUI")
export class FailUI extends BaseUI {
	public layerType = EUILayer.Notice
	public blockOnceAdType = EBlockOnceAdType.None

	private cSpriteLoaderCC_tip: SpriteLoaderCC = null!
	private cNativeHight: Node = null!
	private cBtns: Node = null!

	protected openByAudioUrls = [
		CSceneData.audio.fail,
	]
	protected get toDayMaxRecode() { return this.getCacheComponent("ToDayMaxRecode") as ToDayMaxRecode }

	private openTime = -1

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

		_audio.play(this.audioUrls[0])
		this.openTime = Times.second()

		switch (_gameType.type) {
			case EGameType.today:
				this.cSpriteLoaderCC_tip.setSpriteFrameUrl("scene/texture/end/" + tipName[0])
				this.toDayMaxRecode.node.active = true
				break;
			default:
				this.cSpriteLoaderCC_tip.setSpriteFrameUrl("scene/texture/end/" + tipName[1])
				this.toDayMaxRecode.node.active = false
				break;
		}


		if (_platform.type == EPlatformType.overseas_kwai
			|| _platform.type == EPlatformType.wx)
			_platform._interstitial_.show()

	}

	private onClickIndex() {
		if (_gameType.hasRun()) {
			this.closeUI()
			_gameType.exit()

			if (_platform.type == EPlatformType.oppo)
				_platform._nativeTemp_.hideRoot()
		}
	}

	private onClickReset() {
		if (_gameType.hasRun()) {
			this.closeUI()
			_gameType.reset()

			if (_platform.type == EPlatformType.oppo)
				_platform._nativeTemp_.hideRoot()
		}
	}

	private onClickRevive() {
		_main.showVideo("复活", () => {
			_ui.tip(_language.get(40001))
			this.closeUI()

			if (_gameType.type == EGameType.level)
				_logic._level.revive()
			else {
				_logic._today.revive(Times.second() - this.openTime)
			}

		})
	}

}

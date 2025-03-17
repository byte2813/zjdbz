import { ccclass, BaseUI, EUILayer, EBlockOnceAdType, EPlatformType, EBottomAdType, _prop, _config_, _platform, SkinHelper, _logic } from "../../main/script/Main"
import { SkinUIItem } from "./SkinUIItem"



@ccclass("SkinUI")
export class SkinUI extends BaseUI {
	public layerType = EUILayer.Panel
	public blockOnceAdType = EBlockOnceAdType.None

	protected onCreate(): void {
		switch (_platform.type) {
			case EPlatformType.wx:
				this.bottomAdType = EBottomAdType.Native
				break
			default:
				this.bottomAdType = EBottomAdType.Banner
				break
		}
		this.addEvent(SkinHelper.EventType.CHANGE, this.noAnimUpdateView, this, _logic.arrowSkin)
		this.addEvent(SkinHelper.EventType.UNLOCK, this.noAnimUpdateView, this, _logic.arrowSkin)
	}

	protected onOpen(): void {
		this.ListCC.isPlayAnim = true
		this.updateView()
	}

	private noAnimUpdateView() {
		this.ListCC.isPlayAnim = false
		this.updateView()
	}

	private updateView() {
		this.ListCC.render(_config_.arr.skin_item, SkinUIItem, (comp, data) => {
			comp.initArrow(data)
		})
	}

}

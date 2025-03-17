import { IConfigFishSkin } from "../../app/Config"
import { ccclass, BaseComponent, _prop, _main, _logic, _ui } from "../../main/script/Main"



@ccclass("SkinUIItem")
export class SkinUIItem extends BaseComponent {

	private config: IConfigFishSkin = null!

	public initArrow(config: IConfigFishSkin) {
		this.config = config
		this.updateView()
	}

	private updateView() {
		let index = 0
		if (_logic.arrowSkin.has(this.config.id)) {
			if (_logic.arrowSkin.cur == this.config.id)
				index = 2
			else
				index = 1
		}
		else {
			index = 0
		}
		this.ControllerCC.index = index

		this.SpriteLoaderCC.setSpriteFrameUrl(this.config.icon_url)
	}


	onClick() {
		switch (this.ControllerCC._index) {
			case 0:
				_main.showVideo(
					"获取" + (this.config.configName == "skin_item" ? "箭头" : "背景") + "皮肤-id{" + this.config.id + "}",
					() => {
						_logic.arrowSkin.unlock(this.config.id)
						_ui.tip("获得成功")
					}
				)
				break;
			case 1:
				_ui.tip("使用成功")
				_logic.arrowSkin.use(this.config.id)
				break;
			case 2:
				_ui.tip("正在使用中")
				break;
		}
	}

}
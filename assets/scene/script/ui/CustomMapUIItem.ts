import { Label } from "cc"
import { ccclass, BaseComponent, Times } from "../../../main/script/Main"





@ccclass("CustomMapUIItem")
export class CustomMapUIItem extends BaseComponent {

	private cLabel_time: Label = null!
	private cLabel_count: Label = null!
	private cAShare: Node = null!

	public index: number = -1

	public init(index: number) {
		this.index = index

		let data = _battleCustom.getMap(this.index)
		this.cLabel_count.string = (this.index + 1) + ""
		this.cLabel_time.string = Times.toLocaleString(data.createTime * 1000)
		if (_battleCustom.deDataByCreateCount(data.data.p) != 0) {
			this.cAShare.active = true
		}
		else {
			this.cAShare.active = false
		}

	}

	onClick() {
		_battleCustom.editorRun(this.index)
	}

	private onClickAShare() {
		_battleCustom.shareMap(this.index)
	}

}
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn打开 http://web3incubators.com/
//电报https://t.me/gamecode999
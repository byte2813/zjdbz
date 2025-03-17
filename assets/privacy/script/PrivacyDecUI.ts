import { Label } from "cc"
import { PrivacyDecUIItem } from "./PrivacyDecUIItem"
import { ccclass, BaseUI, EUILayer } from "../../main/script/Main"


export interface IPrivacyDecUI {
	path: string
	count: number
	pathPirfix?: string
	gameName: string
}

@ccclass("PrivacyDecUI")
export class PrivacyDecUI extends BaseUI {
	public layerType = EUILayer.NoticeUp

	private cLabel_top_dec: Label = null!

	public _openData: IPrivacyDecUI = null!

	onOpen() {
		this.cLabel_top_dec.string = this._openData.gameName

		this.ListCC.render(this._openData.count, PrivacyDecUIItem, (comp, data, index) => {
			comp.init("privacy/texture/" + this._openData.path + (this._openData.pathPirfix || "") + (index + 1))
		})
		this.ListCC.ScrollView.scrollToTop(0)
	}

}

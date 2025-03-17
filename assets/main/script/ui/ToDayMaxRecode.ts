
import { Label } from "cc";
import { _logic, BaseComponent, ccclass, Times } from "../Main";




@ccclass("ToDayMaxRecode")
export class ToDayMaxRecode extends BaseComponent {

	private cLabel_time: Label = null!

	onEnable(): void {
		super.onEnable()
		let time = _logic._today.todayTime
		if (time == -1) {
			this.SwitchChildrenCC.index = 0
		}
		else {
			this.SwitchChildrenCC.index = 1
			this.cLabel_time.string = Times.numHourCountDown(time * 1000)
		}
	}
}

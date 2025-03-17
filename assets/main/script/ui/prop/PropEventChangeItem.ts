import { Node, Sprite } from "cc"
import { ccclass, BaseComponent, property, EventHandlerCC, PropHelper, IConfigProp, _prop, _config_, _language, Vector3 } from "../../Main"
import { EPropId } from "../../module/define/LogicDefine"


@ccclass("PropEventChangeItem")
export class PropEventChangeItem extends BaseComponent {
	public backupDescribe = "道具数量刷新"

	@property({
		type: EPropId,
		displayName: "prop表ID"
	})
	public configID = EPropId.power

	@property({
		displayName: "显示最大数量"
	})
	public isShowMaxCount: boolean = false

	@property({
		type: Sprite,
		displayName: "自动恢复进度条"
	})
	public spriteAutoResumeRatio: Sprite = null!

	@property({
		type: Node,
		displayName: "不需要恢复时关闭"
	})
	public nodeAutoResumeNoClose: Node = null!

	@property({
		type: Node,
		displayName: "飞行道具位置"
	})
	public flyItemPos: Node = null!

	private prop: PropHelper = null!

	private config: IConfigProp = null!


	onLoad() {
		this.prop = _prop.singles.get(this.configID)
		this.config = _config_.obj.prop[this.configID]
		if (_prop.hasOpenUI(this.prop))
			this.onClick = function () {
				_prop.openGetUI(this.prop)
			}

		super.onLoad()

		this.addEvent(PropHelper.EventType.CHANGE, this.onEventChange, this, this.prop)
		this.addEvent(PropHelper.EventType.ADD, this.onEventAdd, this, this.prop)
		this.addEvent(_prop.EventType.FLY_TIP_COMPLETE, this.onEventFlyTipComplete, this, _prop)
		if (this.isShowMaxCount)
			this.LabelNumRollCC.lastStr = "/" + this.prop.maxCount


		this.addEvent(_language.EventType.CHANGE, (complete: () => void) => {
			this.LabelNumRollCC.updateString(this.LabelNumRollCC.cur)
			complete()
		}, this, _language)
	}

	onEnable() {
		super.onEnable()
		this.updateLabel(this.prop.cur, false)
		this.scheduleOnce(() => {
			let pos = _prop.singlesByUIWorldPosition[this.configID] as Vector3
			if (!pos)
				pos = _prop.singlesByUIWorldPosition[this.configID] = new Vector3();
			pos.set(this.flyItemPos.worldPosition)
		})
	}

	onUpdate() {
		if (!this.prop.intervalTime)
			return
		if (this.spriteAutoResumeRatio)
			this.spriteAutoResumeRatio.fillRange = this.prop.intervalTime.ratio

		if (this.nodeAutoResumeNoClose)
			this.nodeAutoResumeNoClose.active = this.prop.cur < this.prop.maxCount
	}

	private onEventChange(cur: number, last: number) {
		// 减
		if (last >= cur) {
			this.LabelNumRollCC.isAnim = false
			this.updateLabel(this.prop.cur, false)
		}
	}

	private onEventAdd(count: number, isAutoResume: boolean) {
		if (isAutoResume != _prop.numRollAnimParam)
			if (this.config.is_fly != 1 || isAutoResume)
				this.updateLabel(this.prop.cur, false)
	}

	private onEventFlyTipComplete(id: number) {
		if (this.configID == id) {
			this.AnimtorCC.playDefault()
			this.updateLabel(this.prop.cur, true)
		}
	}

	private updateLabel(num: number, to: boolean) {
		num = Math.ceil(num)
		if (to)
			this.LabelNumRollCC.toByString(num)
		else
			this.LabelNumRollCC.setString(num)
	}

}




/**
 * 2=> 2-1
 * 1-2
 */

import { Node } from "cc"
import { ccclass, BaseUI, EUILayer, Move, LoadDir } from "../../../main/script/Main"

enum EAnimType {
	delay,
	moveUp,
	moveLeft,
	moveDown,
	moveRight,
}
const animOnce2 = EAnimType.moveUp

const amimDatas: EAnimType[][] = [
	[
		EAnimType.moveRight,
		EAnimType.moveUp,
		EAnimType.moveRight,
		EAnimType.moveDown,
		EAnimType.delay,
		EAnimType.delay,
		EAnimType.moveLeft,
		EAnimType.moveUp,
		EAnimType.moveLeft,
		EAnimType.moveDown,
		EAnimType.delay,
		EAnimType.delay,
	],
	[
		EAnimType.moveLeft,
		EAnimType.moveDown,
		EAnimType.delay,
		EAnimType.delay,
		EAnimType.moveRight,
		EAnimType.moveUp,
		EAnimType.moveRight,
		EAnimType.moveDown,
		EAnimType.delay,
		EAnimType.delay,
		EAnimType.moveLeft,
		EAnimType.moveUp,
	],
	[
		EAnimType.delay,
		EAnimType.delay,
		EAnimType.moveLeft,
		EAnimType.moveUp,
		EAnimType.moveLeft,
		EAnimType.moveDown,
		EAnimType.delay,
		EAnimType.delay,
		EAnimType.moveRight,
		EAnimType.moveUp,
		EAnimType.moveRight,
		EAnimType.moveDown,
	]
]

const animOnceDuration = .2
const w = 100
const h = 130
const leftX = -104
const rgihtX = 104
const upY = 134


@ccclass("ResetCardAnimUI")
export class ResetCardAnimUI extends BaseUI {
	public layerType = EUILayer.NoticeUp

	private cAContent: Node = null!

	private moves: Move[] = []
	private loadDir = new LoadDir(2, null!)

	protected onCreate(): void {
		for (let child of this.cAContent.children) {
			let move = new Move()
			move.init(child, false, 10)
			this.moves.push(move)
		}
	}

	onOpen() {
		this.cAContent.children[0].setPosition(leftX, 0)
		this.cAContent.children[1].setPosition(0, 0)
		this.cAContent.children[2].setPosition(rgihtX, 0)

		let count = 0
		let anim = () => {
			count++
			console.log("第" + count + "轮动画")
			this.animAll(anim)
		}

		this.anim(1, animOnce2, anim)
	}

	protected onClose(): void {
		for (let move of this.moves)
			move.clear()
		this.unscheduleAllCallbacks()
		this.loadDir.onFinish = null!
	}

	protected onUpdate(): void {
		for (let move of this.moves)
			move.onUpdate()
	}

	private animAll(complete: () => void) {
		let len = amimDatas[0].length

		let index = -1
		let anim = () => {
			index++
			if (index >= len) {
				complete()
			}
			else
				this.animAllOnce(index, anim)
		}
		anim()
	}

	private animAllOnce(j: number, complete: () => void) {
		this.loadDir.count = 3
		this.loadDir.onFinish = complete
		for (let i = 0; i < amimDatas.length; i++) {
			this.anim(i, amimDatas[i][j], this.loadDir.subCount())
		}
	}

	private anim(i: number, type: EAnimType, complete: () => void) {

		if (type == EAnimType.delay) {
			this.scheduleOnce(complete, animOnceDuration)
			return
		}

		let move = this.moves[i]
		let child = this.cAContent.children[i]
		move.setRunData(1, (data) => {
			switch (type) {
				case EAnimType.moveDown:
					data.target.y = 0
					data.target.x = child.position.x

					data.speed = upY / animOnceDuration
					break
				case EAnimType.moveUp:
					data.target.y = upY
					data.target.x = child.position.x
					data.speed = upY / animOnceDuration
					break
				case EAnimType.moveLeft:
					data.target.y = child.position.y
					data.target.x = child.position.x + leftX
					data.speed = Math.abs(leftX) / animOnceDuration
					break
				case EAnimType.moveRight:
					data.target.y = child.position.y
					data.target.x = child.position.x + rgihtX
					data.speed = Math.abs(rgihtX) / animOnceDuration
					break
			}


		})

		move.run(complete)
	}


}

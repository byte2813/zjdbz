
import { sys, _decorator, Component, Sprite, Label, lerp, assetManager, UITransform, Node } from "cc";
import { EDITOR } from "cc/env";
import { initData } from "./GameDefine";


// 加载主包
let isEnter = false;
(function () {
    if (EDITOR)
        return
    if (isEnter)
        return
    isEnter = true

    let _wx = (window as any)["wx"]
    if (_wx && _wx.startRenderDestroy)
        _wx.startRenderDestroy()

    console.log("load bundle main " + Date.now())
    assetManager.loadBundle("main2")
})();


// cc启动脚本
const { ccclass, property, menu } = _decorator;

const textStr = [
    "加载中",
    "加载中·",
    "加载中··",
    "加载中···",
]


@ccclass("App")
@menu("App")
export class App extends Component {

    private spriteRatio: Sprite = null!
    private ratio = 0
    private sp: UITransform = null!
    private topText: Label = null!
    private textTime = 0
    private textIndex = 0
    private followRatio: Node = null!

    private ratioWidth = 0

    onLoad() {
        let loading = this.node.getChildByName("Loading")!
        let ratio = loading.getChildByName("Ratio")!

        this.topText = ratio.getChildByName("TopText")!.getComponent(Label)!
        this.topText.node.active = initData.showLoadingText

        let dec = loading.getChildByName("BottomDec")!
        // if (initData.versionId && initData.showLoadingText) {
        //     dec.active = true
        //     dec.getComponentInChildren(Label)!.string = initData.versionId
        // }
        // else
            dec.active = false

        loading.getChildByName("Age")!.active = initData.showLoadingText

        let Bg = ratio.getChildByName("Bg")!

        let Ratio = Bg.getChildByName("Ratio")!
        this.ratioWidth = Ratio.getComponent(UITransform)!.width
        this.spriteRatio = Ratio.getComponent(Sprite)!
        this.sp = this.spriteRatio.getComponent(UITransform)!

        this.followRatio = Bg.getChildByName("FollowRatio")!

        this.updateRatio()
    }

    private updateRatio() {
		this.spriteRatio.fillRange = this.ratio

        if (this.followRatio) 
            this.followRatio.setPosition(this.ratioWidth * (this.ratio - .5), 0)
    }


    protected update(dt: number): void {
        // 2秒
        this.ratio = lerp(this.ratio, 1, .005)
        this.updateRatio()

        this.textTime += dt
        if (this.textTime > .5) {
            this.textTime = 0
            this.topText.string = textStr[this.textIndex % textStr.length]
            this.textIndex++
        }
    }

}


import { ccclass, ListCCByBaseItemCC } from "../../main/script/Main"

@ccclass("PrivacyDecUIItem")
export class PrivacyDecUIItem extends ListCCByBaseItemCC {


    private url: string = ""
    public init(url: string) {
        this.url = url
    }

    public listInit() {
        this.SpriteLoaderCC.setSpriteFrameUrl(this.url, true)
    }


}
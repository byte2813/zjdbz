'use strict';
const Name = "csv_to_json"
module.exports = {
    // 扩展内定义的方法 package.json messsage发送的方法
    methods: {
        openPanel() {
            console.log("正在打开 " + Name + " 插件")
            Editor.Panel.open(Name)
        }
    },
    // 当扩展被启动的时候执行
    load() {
        console.log(Name + " 插件启动")

    },
    // 当扩展被关闭的时候执行
    unload() {
        console.log(Name + " 插件关闭")

    }
}
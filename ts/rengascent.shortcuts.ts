import { Monaco, monaco } from "./monaco";

// TODOs
// 多模式显式（竖屏/分体）
// 拖放支持（协议支持）
// 表格支持
// 快捷键支持
// 色彩选单支持（协议支持）
// 新脚本入口

export module Shortcuts {
    export function bindShortcuts(editorId: string) {
        let editor = Monaco.getEditor(editorId);

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU, () => {});
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {});
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC, () => {
            
        });
        editor.addCommand(monaco.KeyMod.Alt, () => {
            
        });
    }
}
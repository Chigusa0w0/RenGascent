import { monaco } from "./monaco.editor"
import { BBSemantic } from "./monaco.bbsemantic";
import { BBAdapter } from "./monaco.bbadapter";

export import monaco = monaco;

declare global {
    interface Window {
         __editors: { [id: string]: (monaco.editor.IStandaloneCodeEditor) };
         __bbcodeRegistered: boolean | undefined;
    }
}

export module Monaco {

    export function create(editorId: string, language: string, readOnly: boolean, initContent: string): void {
        const bbcodeConfOverride = BBSemantic.registerBbcode();
        const bbAdapter = new BBAdapter.AdaptionService();

        let confOverride = {}
        if (language === "bbcode") {
            confOverride = bbcodeConfOverride;
        }

        const elem = document.getElementById(editorId);
        if (elem === null) return;

        elem.innerHTML = "";

        let conf: monaco.editor.IStandaloneEditorConstructionOptions = {
            theme: "bbcode",
            value: initContent,
            language: language,
            readOnly: readOnly,
            scrollBeyondLastLine: !readOnly,

            automaticLayout: true,
            colorDecorators: true,
            renderControlCharacters: true,
            renderValidationDecorations: "on",
            renderWhitespace: "all",
            wordWrap: "on",

            scrollbar: {
                alwaysConsumeMouseWheel: false
            }
        };

        conf = Object.assign(conf, confOverride);

        const editor = monaco.editor.create(elem, conf);

        bbAdapter.refreshSyntax(editor);
        bbAdapter.registerService(editor);
        bbAdapter.finialize(editor);

        if (window.__editors === null || window.__editors === undefined) {
            window.__editors = {};
        }

        window.__editors[editorId] = editor;
    }

    export function changeContent(editorId: string, content: string): void {
        const editor = window.__editors[editorId];

        if (editor !== null && editor !== undefined) {
            editor.executeEdits('monaco', [{ 
                range: new monaco.Range(1, 1, 2147483647, 1), 
                text: content, 
                forceMoveMarkers: false 
            }]);
        }
    }

    export function updateContent(editorId: string, content: string): void {
        const editor = window.__editors[editorId];

        if (editor !== null && editor !== undefined) {
            let model = editor.getModel();
            if (!model) return;

            const currentPosition = editor.getSelection()?.getStartPosition() ?? editor.getPosition() ?? new monaco.Position(1, 1);
            const currentIndex = model.getOffsetAt(currentPosition);

            editor.pushUndoStop();

            editor.executeEdits('monaco', [{ 
                range: editor.getSelection() ?? posToRange(editor.getPosition() ?? new monaco.Position(1, 1)),
                text: content,
                forceMoveMarkers: false
            }]);

            const targetPosition = model.getPositionAt(currentIndex + content.length);
            editor.setPosition(targetPosition);
        }
    }

    export function fetchContent(editorId: string): string {
        const editor = window.__editors[editorId];

        if (editor !== null && editor !== undefined) {
            return editor.getValue();
        }

        return "";
    }

    export function getEditor(editorId: string): monaco.editor.IStandaloneCodeEditor {
        return window.__editors[editorId];
    }

    function posToRange(pos: monaco.IPosition): monaco.IRange {
        return new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
    };
}
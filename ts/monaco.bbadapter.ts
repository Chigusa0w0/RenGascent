import { monaco } from "./monaco.editor"
import { BBSyntax } from "./morula.bbsyntax";

export module BBAdapter {

    export class AdaptionService {
        
        renderdelay: number;
        inputBufferDelay: number;

        constructor() {
            this.renderdelay = 0;
            this.inputBufferDelay = 50;
        }

        convertToMarker(model: monaco.editor.ITextModel, notice: BBSyntax.Notice): monaco.editor.IMarkerData {
            let startIdx = notice.range.index;
            let endIdx = startIdx + notice.range.length;
            let startPos = model.getPositionAt(startIdx);
            let endPos = model.getPositionAt(endIdx);

            let level = 0;
            switch (notice.level) {
                case BBSyntax.NoticeLevel.Error: level = monaco.MarkerSeverity.Error; break;
                case BBSyntax.NoticeLevel.Warning: level = monaco.MarkerSeverity.Warning; break;
                case BBSyntax.NoticeLevel.Message: level = monaco.MarkerSeverity.Info; break;
                case BBSyntax.NoticeLevel.Success: level = monaco.MarkerSeverity.Hint; break;
            }

            return {
                startLineNumber: startPos.lineNumber,
                startColumn: startPos.column,
                endLineNumber: endPos.lineNumber,
                endColumn: endPos.column,
                message: notice.message,
                severity: level
            };
        }

        refreshSyntax(editor: monaco.editor.IStandaloneCodeEditor) {
            const model = editor.getModel();
            if (!model) return;

            const syntax = new BBSyntax.SyntaxChecker(editor.getValue());
            const token = syntax.tokenPass();
            const scope = syntax.scopePass(token);
            const tree = syntax.treePass(scope);
            const args = syntax.argsPass(tree);
            const errors = syntax.findings;

            const markers: monaco.editor.IMarkerData[] = [];
            for (let i = 0; i < errors.length; i++) {
                markers.push(this.convertToMarker(model, errors[i]));
            }

            monaco.editor.setModelMarkers(model, "rengascent", markers);
        }

        registerService(editor: monaco.editor.IStandaloneCodeEditor) {
            const model = editor.getModel();
            if (!model) return;

            model.onDidChangeContent((e: any) => {
                clearTimeout(this.renderdelay);

                this.renderdelay = window.setTimeout(() => {
                    this.refreshSyntax(editor);
                }, this.inputBufferDelay);
            });
        }

        finialize(editor: monaco.editor.IStandaloneCodeEditor) {
            const model = editor.getModel();
            if (!model) return;

            model.setEOL(monaco.editor.EndOfLineSequence.LF);
        }
    }
}
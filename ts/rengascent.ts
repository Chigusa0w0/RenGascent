import { Moana } from "./moana";
import { Monaco, monaco } from "./monaco";
import { Protocol } from "./rengascent.protocol";

export module Rengascent {
    
    let renderdelay = 0;
    let inputBufferDelay = 100;

    export function refreshPreview(model: monaco.editor.ITextModel, viewerId: string) {
        let value = model.getValue();
        inputBufferDelay = Math.max(100, Math.min(value.length / 40, 1000));

        if (Moana.getViewer(viewerId).vmStart) {
            Moana.getViewer(viewerId).vmStart(value);
        }
        else {
            setTimeout(() => {
                refreshPreview(model, viewerId);
            }, 50);
        }
    }

    export function create(editorId: string, viewerId: string, initContent: string): void {
        Monaco.create(editorId, "bbcode", false, initContent);
        Moana.create(viewerId, initContent);

        let editor = Monaco.getEditor(editorId);
        let model = editor.getModel();
        if (!model) return;

        model.onDidChangeContent((e) => {
            clearTimeout(renderdelay);
            renderdelay = setTimeout(() => {
                refreshPreview(model!, viewerId);
            }, inputBufferDelay);
        });

        Protocol.createChannel(editorId, viewerId);
    }
}
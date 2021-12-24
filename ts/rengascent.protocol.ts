import { Monaco } from './monaco';
import { Environment } from './rengascent.env';

/*
    Frame -> Parent
        Compatiable:
            rgEditorReciveContent       - return content to invoker
        Required:
            rgEditorProbeContent        - request parent to send content
        Optional:
            rgEditorUploadRequest       - redirect upload drag & drop request
            rgEditorDisplayDialog       - redirect color selector and symbol selector
        Unsupported:
            rgEditorReciveHeight        - request to set parent height
            rgEditorParseImgSrc         - request to parse image source

    Parent -> Frame
        Compatiable:
            loadContentFromParentFrame  - set content by invoker
            returnContentToParent       - send content to invoker
            insertCodeFromParentFrame   - apply source edit by invoker
        Optional:
            setEnvironmentVariable      - set environment variables with a json (require: __SETTING)
        Unsupported:
            setImgSrc                   - response to wysiwygEditorParseImgSrc
            setVarFromParentFrame       - eval version of setEnvironmentVariable
*/

export module Protocol {

    export function createChannel(editorId: string, viewerId: string) {
        window.addEventListener("message", (e) => {
            if(!e.origin.match(/(?:nga\.cn|ngacn\.cc|nga\.178\.com|nga\.donews\.com|ngabbs.com|bigccq\.cn|127\.0\.0\.1)(?::\d+)?$/)) {
                return;
            }

            let method: string;
            let callback: string | null;
            let value: any;

            const matches = String(e.data).match(/(\w+)\s+(\w+)\s+([^]+)/);
            if (!matches) return;

            method = matches[1];
            callback = matches[2];
            value = matches[3];

            if (!method || method === "null") return;
            if (callback === "null") callback = null;
            if (value === "null") value = null;

            if (method) {
                window.messageOrigin = e.origin;
                handleMessage(method, callback, value, editorId, viewerId);
            }
        });

        if (window.messageBuffer) {
            let msgBuf = window.messageBuffer;
            window.messageBuffer = null;

            for (let i = 0; i < msgBuf.length; i++) {
                let buf = msgBuf[i];

                handleMessage(buf.method, buf.callback, buf.value, editorId, viewerId);
            }
        }
    }

    export function pullContent(editorId: string) {
        sendMessage("rgEditorProbeContent", null, null);
    }

    export function pushContent(editorId: string) {
        sendMessage("rgEditorReciveContent", null, Monaco.fetchContent(editorId));
    }

    export function requestUpload() {
        throw new Error("Not Implemented");
        sendMessage("rgEditorUploadRequest", null, JSON.stringify(""));
    }

    export function displayDialog() {
        throw new Error("Not Implemented");
        sendMessage("rgEditorDisplayDialog", null, "");
    }

    function sendMessage(method: string, callback: string | null, value: string | null) {
        window.parent.postMessage(`${method} ${callback} ${value}`, window.messageOrigin);
        console.log(`${method} ${callback} ${value}`);
    }

    function handleMessage(method: string, callback: string | null, value: string | null, editorId: string, viewerId: string) {
        let response: string | null = null;

        switch(method) {
            // old compatiable
            case "loadContentFromParentFrame":
                response = safeInvokeString((x) => setContent(editorId, x), value);
                break;
            
            case "returnContentToParent":
                response = safeInvokeString((x) => getContent(editorId), null);
                break;

            case "insertCodeFromParentFrame":
                response = safeInvokeJson<TextFragment>((x) => !!x.text, (x) => replaceTextFrag(editorId, x), value);
                break;
            
            // new added            
            case "setEnvironmentVariable":
                response = safeInvokeJson<Object>((x) => x instanceof Object, (x) => setEnvVar(editorId, x), value);
                break;
            
            // unsupported
            case "setImgSrc":
            case "setVarFromParentFrame":
            default:
                response = null;
                break;
        }

        if ((response !== null) && (callback !== null)) {
            sendMessage(callback, null, response);
        }
    }

    function safeInvokeJson<T>(cls: (arg: any) => boolean, fn: (arg: T) => any, value: string | null): string | null {
        let obj: any;

        try {
            obj = value ? JSON.parse(value) : null;
        }
        catch (e) {
            console.error(e);
            return null;
        }

        if (!cls(obj)) return null;

        try {
            const result = fn(obj as T);
            return JSON.stringify(result);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    function safeInvokeString(fn: (arg: string | null) => any, value: string | null): string | null {
        try {
            const result = fn(value);
            return JSON.stringify(result);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    function setContent(editorId: string, value: string | null) {
        Monaco.changeContent(editorId, value || "");
        return null;
    }

    function getContent(editorId: string) {
        pushContent(editorId);
        return null;
    }

    function replaceTextFrag(editorId: string, value: TextFragment) {
        Monaco.updateContent(editorId, value.text);
        return null;
    }

    function setEnvVar(editorId: string, value: Object) {
        Environment.envVariables = value;
        return null;
    }

    class TextFragment {
        text: string = "";
    }
}

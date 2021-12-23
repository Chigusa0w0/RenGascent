import { NgaVM } from "./moana.ngavm";
import { NgaData } from "./moana.ngadata"

declare global {
    interface Window { __viewers: { [id: string]: (HTMLIFrameElement) }; }
    interface HTMLIFrameElement { vmStart: (data: string | NgaData.IContentData) => boolean }
}

export module Moana {

    export const moanaPlaceholder = "[align=center][color=silver]键入任意内容以更新预览[/color][/align]";

    export function create(viewerId: string, initContent: string | NgaData.IContentData): void {
        const elem = document.getElementById(viewerId);
        if (!elem) return;

        elem.innerHTML = "";

        const iframe = document.createElement("iframe");
        iframe.src = "../html/ngavm.html";
        iframe.id = `${viewerId}-iframe`;
        iframe.style.background = "#fff0cd";
        iframe.style.border = "none";
        iframe.style.height = "100%";
        iframe.style.margin = "0";
        iframe.style.padding = "0";
        iframe.style.width = "100%";
        elem.append(iframe);

        var iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.readyState == 'complete') {
            handleLoaded(viewerId, initContent, iframe)
        }
        else {
            iframe.addEventListener("load", e => handleLoaded(viewerId, initContent, iframe));
        }

        // register in global
        if (window.__viewers === null || window.__viewers === undefined) {
            window.__viewers = {};
        }

        window.__viewers[viewerId] = iframe;
    }

    function handleLoaded(viewerId: string, initContent: string | NgaData.IContentData, iframe: HTMLIFrameElement) {
        if (!iframe.contentWindow || !iframe.contentDocument) return;

        // parent authority
        iframe.contentWindow.needReload = () => { create(viewerId, moanaPlaceholder); };
        iframe.contentWindow.viewarea = iframe;
        iframe.contentWindow.viewareaHeightOffset = 14;
        
        if (!initContent || initContent === "") {
            initContent = moanaPlaceholder;
        }

        iframe.contentWindow.initContent = initContent;
    }

    export function changeContent(viewerId: string, content: string, isStructured: boolean): void {
        const viewer = window.__viewers[viewerId];

        if (viewer !== null && viewer !== undefined) {
            if (isStructured) {
                viewer.vmStart(JSON.parse(content) as NgaData.IContentData);
            }
            else {
                viewer.vmStart(content);
            }
        }
    }

    export function getViewer(viewerId: string): HTMLIFrameElement {
        return window.__viewers[viewerId];
    }
    
    export function injectBeforeHead(env: Window, doc: Document): void {
        NgaVM.previewRoutines(env, doc);
        NgaVM.previewData(env, doc);
    }

    export function injectAfterHead(env: Window, doc: Document): void {
        
    }

    export function injectBeforeBody(env: Window, doc: Document): void {
        NgaVM.previewInitializer(env, doc);
    }

    export function injectAfterBody(env: Window, doc: Document): void {
        NgaVM.previewFinalizer(env, doc);
    }
}
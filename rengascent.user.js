// ==UserScript==
// @name         RenGascent NGA
// @version      2.2.6
// @description  RenGascent 论坛代码编辑器
// @author       Chigusa0w0
// @copyright    2021, Chigusa0w0 (https://github.com/Chigusa0w0)
// @license      MIT
// @match        *://bbs.nga.cn/post.php*
// @match        *://ngabbs.com/post.php*
// @match        *://nga.178.com/post.php*
// @run-at       document-end
// @updateURL    https://cdn.jsdelivr.net/gh/Chigusa0w0/RenGascent@master/rengascent.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/Chigusa0w0/RenGascent@master/rengascent.user.js
// @supportURL   https://github.com/Chigusa0w0/RenGascent/issues
// @homepage     https://github.com/Chigusa0w0/RenGascent
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/Chigusa0w0/RenGascent@v2.2.6/rengascent.semantic.js
// @require      https://cdn.jsdelivr.net/gh/Chigusa0w0/RenGascent@v2.2.6/rengascent.syntax.js
// @require      https://cdn.jsdelivr.net/gh/Chigusa0w0/RenGascent@v2.2.6/rengascent.preview.js
// ==/UserScript==

// 版本历史
// 2.2.6:
//   + 修复换行符兼容性问题
// 2.2.5:
//   + 支持从独立预览框返回常规模式
//   + 预览字体跟随 NGA 显示设置
//   + 跟随论坛最新改动
// 2.2.4:
//   + 颜色选择浮窗
//   + dice 快捷键 Ctrl + Shift + D
//   + 横排模式与分屏支持
//   + 修复即时预览灾难恢复的 bug
// 2.2.3:
//   + 语法提示消息优化
//   + TamperMonkey 缓存应对
//   + 修复语法提示中若干罕见 bug
//   + 修复即时预览灾难恢复的 bug

(function() {
    'use strict';

    // 设置 X 毫秒无输入后进行即时预览渲染
    const inputBufferDelay = 200;

    // 设置预览窗口并排模式 true = 横向并列 false = 竖向排列
    const useSideBySideLayout = false;

    var textarea;
    var editarea;
    var viewarea;
    var prevarea;
    var prevtext;
    var backup;
    var renderdelay;

    // iframe source. keep it simple
    const monacoEnvironment = `
        <!DOCTYPE html>
        <html style="height:100%">

        <head>
            <base href="https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/">
            <style>
                #loading .spinner {
                    margin: 100px auto;
                    width: 50px;
                    height: 40px;
                    text-align: center;
                    font-size: 10px
                }

                #loading .spinner>div {
                    background-color: #333;
                    height: 100%;
                    width: 6px;
                    display: inline-block;
                    -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
                    animation: sk-stretchdelay 1.2s infinite ease-in-out
                }

                #loading .spinner .rect2 {
                    -webkit-animation-delay: -1.1s;
                    animation-delay: -1.1s
                }

                #loading .spinner .rect3 {
                    -webkit-animation-delay: -1s;
                    animation-delay: -1s
                }

                #loading .spinner .rect4 {
                    -webkit-animation-delay: -.9s;
                    animation-delay: -.9s
                }

                #loading .spinner .rect5 {
                    -webkit-animation-delay: -.8s;
                    animation-delay: -.8s
                }

                @-webkit-keyframes sk-stretchdelay {

                    0%,
                    100%,
                    40% {
                        -webkit-transform: scaleY(.4)
                    }

                    20% {
                        -webkit-transform: scaleY(1)
                    }
                }

                @keyframes sk-stretchdelay {

                    0%,
                    100%,
                    40% {
                        transform: scaleY(.4);
                        -webkit-transform: scaleY(.4)
                    }

                    20% {
                        transform: scaleY(1);
                        -webkit-transform: scaleY(1)
                    }
                }
            </style>
            <link data-name="vs/editor/editor.main" rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs/editor/editor.main.css" />
            <style type="text/css">
                body {
                    margin: 0;
                    padding: 0;
                    border: 0;
                    overflow: hidden;
                }
            </style>
        </head>

        <body>
            <div id="loading">
                <div class="spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
            </div>
            <div id="container" style="height:100%;"></div>
            <script>
                var require = {
                    paths: {
                        "vs": "https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs"
                    },
                    "vs/nls": {
                        availableLanguages: {
                            "*": "zh-cn"
                        }
                    }
                };
                window.MonacoEnvironment = {
                    getWorkerUrl: function (workerId, label) {
                        let encoded = [\`self.MonacoEnvironment={\`,
                            \`baseUrl: "https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/"\`, \`};\`,
                            \`importScripts("https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs/base/worker/workerMain.js");\`,
                        ].join(" ");
                        return \`data:text/javascript;charset=utf-8,\${encodeURIComponent(encoded)}\`;
                    }
                };
            </script>
            <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs/loader.js"></script>
            <script type="text/javascript">
                var geval = eval;
                require(["require", "vs/editor/editor.main"], function (require) {
                    "use strict";
                    var loading = document.getElementById("loading");
                    loading.parentNode.removeChild(loading);
                    document.body.style.height = "100%";
                    var container = document.getElementById("container");
                    if (window.preInit) {
                        window.preInit(container, monaco);
                    }
                    var editor = monaco.editor.create(container, {
                        theme: "bbcode",
                        value: "正在加载内容...",
                        language: "bbcode",
                        readOnly: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        colorDecorators: true,
                        renderControlCharacters: true,
                        renderValidationDecorations: "on",
                        autoClosingBrackets: "always",
                        autoIndent: "keep",
                        autoSurround: "brackets",
                        copyWithSyntaxHighlighting: false,
                        detectIndentation: false,
                        insertSpaces: true,
                        renderWhitespace: "all",
                        scrollbar: {
                            alwaysConsumeMouseWheel: false
                        },
                        wordWrap: "on"
                    });
                    if (window.postInit) {
                        window.postInit(container, editor, monaco);
                    }
                });
            </script>
        </body>

        </html>`;
    const moanaEnvironment = `
        <!DOCTYPE html>
        <html>

        <head>
            <meta http-equiv="Content-Type" content="text/html">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta charset="gbk">
            <title id="title">MoanaVM</title>
            <script>
                if (window.preload) window.preload(window, document);
            </script>
            <script type="text/javascript">
                var __CURRENT_UID = 0,
                    __CURRENT_AVATAR = "",
                    __CURRENT_UNAME = "#GUEST#",
                    __CACHE_PATH = "./data/bbscache",
                    __MISC_COOKIE_NAME = "bbsmisccookies",
                    __CHARSET = "GBK",
                    __CURRENT_FID = 0,
                    __CURRENT_F_BIT = 0,
                    __CURRENT_TID = 0,
                    __CURRENT_STID = 0,
                    __SELECTED_FORUM = 0;
            </script>
            <script>
                if (window.load) window.load(window, document);
            </script>
            <script>
                var loaderReadCallback = function () {
                    commonui.aE(window, "bodyInit", function () {
                        _LOADERREAD.init()
                    })
                };
                __SCRIPTS.syncLoad("lib", "dsList", "combine", "dsCommon", "md5", "common", "forum", "admin", "loaderRead");
            </script>
            <script>
                __COOKIE.init(__CKDOMAIN, "/", "bbsmisccookies");
                __SETTING.init(0);
                __SCRIPTS.syncLoad("commonSpec", "bbscode", "bbscodeSpec", "mainMenu", "customBg", "post");
            </script>
            <script>
                __SCRIPTS.syncLoad("read", "armory", "quoteTo");
            </script>
            <style>
                body {
                    background: unset !important;
                }

                #m_posts {
                    border: unset !important;
                    box-shadow: unset !important;
                    border-radius: unset !important;
                    padding-bottom: unset !important;
                    border-bottom: unset !important;
                }

                .module_wrap {
                    margin: unset !important;
                }

                .textfield {
                    max-width: 90% !important;
                }
            </style>
        </head>

        <body>
            <script>
                if (window.setup) window.setup(window, document);
            </script>
            <div class="clear minWidthSpacer" id="minWidthSpacer"></div>
            <div id="mmc">
                <div id="mc">
                    <div id="m_posts" class="module_wrap">
                        <div class="w100" id="m_posts_c">
                            <table class="forumbox postbox" cellspacing="1px">
                                <tr id="post1strow0" class="postrow row2">
                                    <td class="c1" style="vertical-align:top; text-align:center; display: none;"> <span
                                            id="posterinfo0" class="posterinfo"> <a href="" id="postauthor0"
                                                class="author b"></a> </span> </td>
                                    <td class="c2" style="vertical-align:top" id="postcontainer0"> <a name="l0"></a>
                                        <div class="postBtnPos" id="postBtnPos0"></div>
                                        <div class="postInfo" id="postInfo0"> <span id="postdate0" title="reply time"></span>
                                        </div><span id="postcontentandsubject0">
                                            <h3 id="postsubject0"></h3>
                                            <p id="postcontent0" class="postcontent ubbcode"> Loading MoanaVM </p>
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div id="mc">
            </div id="mmc">
            <script>
                if (window.finalize) window.finalize(window, document);
            </script>
        </body>

        </html>`;
    // --- compatibility ---

    const adaptMonaco = function(onto, content) {
        const model = onto.editor.getModel();

        // these are properties using in postfunc library
        Object.defineProperty(onto, "value", {
            get: function() {
                return onto.editor.getValue();
            },
            set: function(value) {
                var currentPosition = onto.editor.getPosition();
                onto.editor.pushUndoStop();
                onto.editor.executeEdits('rengascent', [{ identifier: 'insert', range: posToRange(1, 1, 2147483647, 1), text: value, forceMoveMarkers: false }]);
                onto.editor.setSelection(posToRange(0, 0, 0, 0));
                onto.editor.setPosition(currentPosition);
            }
        });

        Object.defineProperty(onto, "selectionStart", {
            get: function() {
                let start = onto.editor.getSelection().getStartPosition();
                return model.getOffsetAt(start);
            },
            set: function(start) {
                let pos = model.getPositionAt(start);
                let cur = onto.editor.getSelection();
                onto.editor.setSelection(posToRange(pos.lineNumber, pos.column,
                                                    cur.endLineNumber, cur.endColumn));
            }
        });

        Object.defineProperty(onto, "selectionEnd", {
            get: function() {
                let end = onto.editor.getSelection().getEndPosition();
                return model.getOffsetAt(end);
            },
            set: function(end) {
                let pos = model.getPositionAt(end);
                let cur = onto.editor.getSelection();
                onto.editor.setSelection(posToRange(cur.startLineNumber, cur.startColumn,
                                                    pos.lineNumber, pos.column));
            }
        });

        Object.defineProperty(onto.style, "display", {
            get: function() {
                return editarea.style.display;
            },
            set: function(val) {
                editarea.style.display = val;
                viewarea.style.display = val;
            }
        });

        onto.setSelectionRange = function(start, end) {
            let startPos = model.getPositionAt(start);
            let endPos = model.getPositionAt(end);
            onto.editor.setSelection(posToRange(startPos.lineNumber, startPos.column,
                                                endPos.lineNumber, endPos.column));
        };

        onto.focus = function() {
            onto.editor.focus();
        };

        onto._ = {
            self: onto
        };

        onto._.on = function(event, handler) {
            onto.addEventListener(event, handler, false);
        }

        // disable conflicting shortcuts
        onto.editor.addCommand(onto.monaco.KeyMod.CtrlCmd | onto.monaco.KeyCode.KEY_U, function() {});
        onto.editor.addCommand(onto.monaco.KeyMod.CtrlCmd | onto.monaco.KeyCode.Enter, function() {});

        // set eol to lf
        onto.editor.getModel().setEOL(0);

        // restore content
        onto.editor.executeEdits('rengascent', [{ identifier: 'insert', range: posToRange(1, 1, 2147483647, 1), text: content, forceMoveMarkers: false }]);
        backup = content;
        refreshPreview(null);
        refreshSyntax(null);

        // restore dom relation
        unsafeWindow.postfunc.o_content = onto;
        unsafeWindow.postfunc.o_focus_content = onto;
        onto.focus();
    };

    // --- event handler ---

    const refreshPreview = function(e) {
        try {
            if (viewarea.vmStart !== null && viewarea.vmStart !== undefined) {
                if (viewarea.renderbugfix) {
                    // eighth calamity is there
                    recoveryPreview();
                    viewarea.vmStart(textarea.value);
                    viewarea.renderbugfix = false; // recursive refreshPreview-installMoana.load
                }
                else {
                    // everything is fine
                    viewarea.renderbugfix = viewarea.vmStart(textarea.value);
                }
            }
        } catch(e) {
            viewarea.renderbugfix = true;
        }
    }

    const refreshSyntax = function(e) {
        try {
            let model = textarea.editor.getModel();
            let syntax = new BBCode.SyntaxChecker(textarea.value);
            let token = syntax.tokenPass();
            let scope = syntax.scopePass(token);
            let tree = syntax.treePass(scope);
            let args = syntax.argsPass(tree);
            let errors = syntax.findings;

            let markers = [];
            for (let i = 0; i < errors.length; i++) {
                markers.push(convertToMarker(errors[i]));
            }

            textarea.monaco.editor.setModelMarkers(model, "rengascent", markers);
        }
        catch(e) {
            viewarea.renderbugfix = true;
        }
    }

    const recoveryPreview = function() {
        viewarea.contentDocument.location.reload();
    }

    const doSubmit = function() {
        prevtext = textarea.value;
        document.querySelector("table.stdbtn a.uitxt1").click();
    };

    const doColoring = function() {
        document.querySelector("button[title='文字颜色']").click();
    };

    const shortcutKeydown = function(e) {
        let pfn = unsafeWindow.postfunc;
        let cui = unsafeWindow.commonui;

        let propagate = true;

        if (e.ctrlKey && !e.shiftKey) {
            propagate = false;
            switch (e.keyCode) {
                case 13: /* + enter */ doSubmit(); break;

                case 66: /* + b */ unsafeWindow.postfunc.addTag("b"); break;
                case 68: /* + d */ unsafeWindow.postfunc.addTag("del"); break;
                case 73: /* + i */ unsafeWindow.postfunc.addTag("i"); break;
                case 81: /* + q */ unsafeWindow.postfunc.addTag("collapse", "此处填入概要"); break;
                case 83: /* + s */ break; // we are not real vscode
                case 85: /* + u */ unsafeWindow.postfunc.addTag("u"); break;

                default: propagate = true; break;
            }
        }

        else if (e.ctrlKey && e.shiftKey) {
            propagate = false;
            switch (e.keyCode) {
                case 54: /* + 6 */ unsafeWindow.postfunc.addTag("sup"); break;

                case 189: /* + - */ unsafeWindow.postfunc.addTag("sub"); break;
                case 187: /* + = */ unsafeWindow.postfunc.addTag("h"); break;

                case 67: /* + c */ doColoring(); break;
                case 68: /* + d */ unsafeWindow.postfunc.addTag("dice"); break;
                case 71: /* + g */ unsafeWindow.postfunc.addTag("align", "left/center/right"); break;
                case 81: /* + q */ unsafeWindow.postfunc.addTag("quote"); break;
                case 82: /* + r */ unsafeWindow.postfunc.addTag("randomblock"); break;
                case 83: /* + s */ unsafeWindow.postfunc.addTag("size", "此处填入尺寸"); break;
                case 85: /* + u */ unsafeWindow.postfunc.addTag("url", "此处填入链接"); break;

                default: propagate = true; break;
            }
        }

        if (!propagate) {
            cui.cancelEvent(e);
        }
    };

    const dragEnabler = function(e) {
        var postfunc = unsafeWindow.postfunc;
        var commonui = unsafeWindow.commonui;

        if (e.dataTransfer.files) {
            e.dataTransfer.dropEffect = 'copy';
            commonui.cancelBubble(e)
            return commonui.cancelEvent(e)
        }
	};

    const importTableAndFile = function(e, shouldUndo) {
        var data = e.dataTransfer ? e.dataTransfer : e.clipboardData;
        var postfunc = unsafeWindow.postfunc;
        var commonui = unsafeWindow.commonui;

        var html = data.getData('text/html');
        if (html) {
            var m = postfunc.parseTableClip(html);
            if (m && confirm('检测到表格\n是否在光标处导入表格数据\n(仅粘贴表格部分)')) {
                if (shouldUndo) { // wipe original plain text data
                    textarea.editor.trigger('rengascent', 'undo');
                }
                postfunc.addText(m);
                commonui.cancelBubble(e);
                return commonui.cancelEvent(e);
            }
        }

        if (data.files && data.files.length) {
            data.dropEffect = 'none';
            postfunc.o_fileSelector.files = data.files;
            commonui.triggerEvent(postfunc.o_fileSelector, 'change');
            commonui.cancelBubble(e);
            return commonui.cancelEvent(e);
        }

        return;
    };

    const adaptEvents = function(onto) {
        // restore event
        onto.onpaste = (e) => importTableAndFile(e, true);
        onto.ondrop = (e) => importTableAndFile(e, false);
        onto.ondragover = (e) => dragEnabler(e);
        onto.onkeydown = (e) => shortcutKeydown(e);

        // restore backup
        setInterval(() => {
            var val = onto.value;

            if (val !== backup) {
                unsafeWindow.postfunc.backup.add('content', val);
                backup = val;
            }
        }, 1000);

        // setup auto preview & syntax checking
        onto.editor.getModel().onDidChangeContent((e) => {
            clearTimeout(renderdelay);
            renderdelay = setTimeout((e) => {
                refreshPreview(e);
                refreshSyntax(e);
            }, inputBufferDelay);
        });
    };

    // --- language support ---

    const convertToMarker = function(notice) {
        let model = textarea.editor.getModel();
        let startIdx = notice.range.index;
        let endIdx = startIdx + notice.range.length;
        let startPos = model.getPositionAt(startIdx);
        let endPos = model.getPositionAt(endIdx);

        let level = 0;
        switch (notice.level) {
            case 3: level = 8; break;
            case 2: level = 4; break;
            case 1: level = 2; break;
            case 0: level = 1; break;
        }

        let marker = {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber2,
            endColumn: endPos.column,
            message: notice.message,
            severity: level
        }

        return marker;
    }

    const enableBBCode = function(monaco) {
        monaco.languages.register({ id: 'bbcode' });
        monaco.languages.setMonarchTokensProvider('bbcode', bbcodeTokenizer);
        monaco.languages.setLanguageConfiguration('bbcode', bbcodeLang);
        monaco.languages.registerLinkProvider({ language: 'bbcode', exclusive: true }, bbcodeLink);
        monaco.editor.defineTheme('bbcode', bbcodeTheme);
    };

    // iframe hooks

    const monacoPre = function(dom, monaco) {
        enableBBCode(monaco);
    };

    const monacoPost = function(dom, editor, monaco) {
        dom.editor = editor;
        dom.monaco = monaco;

        textarea = dom;

        adaptMonaco(dom, prevtext);
        adaptEvents(dom);
    };

    const moanaPre = function(env, doc) {
        previewRoutines(env, doc);
    };

    const moanaLoad = function(env, doc) {
        previewData(env, doc);
    };

    const moanaSetup = function(env, doc) {
    };

    const moanaPost = function(env, doc) {
        previewFinalizer(env, doc);
    };

    // --- dom helper ---

    const moanaSeperate = function() {
        let hwnd = window.open('/nuke.php','即时预览','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no');
        hwnd.onload = () => {
            viewarea.remove();
            hwnd.document.body.style.margin = '0';
            installMoana($(hwnd.document.body), 2);
            hwnd.onbeforeunload = function() {
                let parent = $(editarea).parent();
                let mode = useSideBySideLayout ? 1 : 0;
                installMoana(parent, mode);
            }
        }
    };

    const moanaRecoverySetup = function() {
        if (document.getElementById('moanaManualRefresh')) return;

        var container = document.getElementById('post_subject').parentNode;
        $(container).append('<button id="moanaManualRefresh">重置预览框</button>');
        $(container).append('<button id="moanaPopupWindow">独立预览框</button>');
        var refresher = document.getElementById('moanaManualRefresh');
        $(refresher).click(() => {
            recoveryPreview();
        });

        var popup = document.getElementById('moanaPopupWindow');
        $(popup).click(() => {
            moanaSeperate();
        });
    }

    // --- dom worker ---

    const installMonaco = function(parent, mode) {
        // load monaco in seperate page to avoid conflict
        let iframe = document.createElement('iframe');
        editarea = iframe;
        iframe.src = '/nuke.php'; // create iframe with webpage hollowing to bypass CORS
        iframe.id = 'monaco';
        iframe.style.background = unsafeWindow.__COLOR.bg0;
        iframe.style.border = '1px solid lightgrey';
        iframe.style.borderRadius = '3px';
        iframe.style.boxSizing = 'border-box';
        iframe.style.height = '50em';
        iframe.style.margin = '0 0 10px';
        iframe.style.minHeight = '10em';
        iframe.style.padding = '0 0 10px';
        iframe.style.resize = 'vertical';
        switch (mode) {
            case 0: // vect layout
                iframe.style.width = '100%';
                break;
            case 1: // hori layout
                iframe.style.width = '50%';
                parent[0].style.display = 'flex';
                break;
        }
        parent.append(iframe);

        iframe.addEventListener('load', function (e) {
            // set up event handlers
            iframe.contentWindow.preInit = monacoPre;
            iframe.contentWindow.postInit = monacoPost;

            // remove all contents and load ours. this will not reset javascript environment
            iframe.contentDocument.open();
            iframe.contentDocument.write(monacoEnvironment);
            iframe.contentDocument.close();
        });
    };

    const installMoana = function(parent, mode) {
        // this is also done for moana
        let iframe = document.createElement('iframe');
        viewarea = iframe;
        iframe.src = '/nuke.php';
        iframe.id = 'moana';
        iframe.style.background = '#fff0cd';
        iframe.style.border = '1px solid lightgrey';
        iframe.style.borderRadius = '3px';
        iframe.style.boxSizing = 'border-box';
        iframe.style.margin = '0 0 10px';
        iframe.style.padding = '0 0 10px';
        iframe.style.resize = 'vertical';
        switch (mode) {
            case 0: // vect layout
                iframe.style.maxHeight = '50em';
                iframe.style.width = '100%';
                iframe.heightOffset = 14;
                break;
            case 1: // hori layout
                iframe.style.width = '50%';
                iframe.heightOffset = 30;
                break;
            case 2: // popup layout
                iframe.style.height = '100%';
                iframe.style.margin = '0';
                iframe.style.padding = '0';
                iframe.style.position = 'fixed';
                iframe.style.width = '100%';
                iframe.heightOffset = 0;
                break;
        }
        iframe.renderbugfix = false;
        parent.append(iframe);
        moanaRecoverySetup();

        iframe.addEventListener('load', function (e) {
            // set up event handlers
            iframe.contentWindow.preload = moanaPre;
            iframe.contentWindow.load = moanaLoad;
            iframe.contentWindow.setup = moanaSetup;
            iframe.contentWindow.finalize = moanaPost;
            iframe.contentWindow.viewarea = viewarea;

            // remove all contents and load ours. this will not reset javascript environment
            iframe.contentDocument.open();
            iframe.contentDocument.write(moanaEnvironment);
            iframe.contentDocument.close();

            iframe.vmStart = iframe.contentWindow.vmStart;
            refreshPreview(null);
            refreshSyntax(null);
        });
    };

    const preinstall = function() {
        // original iframe scroll ban messes up with Moana
        unsafeWindow.commonui.crossDomainCall.setCallBack('iframeReadNoScrollInit', function() {});
        unsafeWindow.commonui.crossDomainCall.setCallBack('iframeReadNoScroll', function() {});
    };

    const initialize = function() {
        if (!isEditor() || isNoMonaco()) {
            return;
        }

        prevarea = $('textarea[name="post_content"]');

        // delete original editor and load ours
        let parent = prevarea.parent();
        prevtext = prevarea.val();
        parent.css("display", "block");
        prevarea.remove();

        let mode = useSideBySideLayout ? 1 : 0;
        preinstall();
        installMonaco(parent, mode);
        installMoana(parent, mode);
    };

    const bugRecovery = function() {
        var container = document.getElementById('post_subject').parentNode;
        $(container).append('<button id="monacoFallback">回退至原版编辑器</button>');
        var button = document.getElementById('monacoFallback');
        $(button).click(() => {
            if (confirm("回退后可使用页面下方的“恢复上次输入的内容”按钮载入当前的输入")) {
                window.location.href = window.location.href + '&noMonaco';
            }
        });
    }

    const isEditor = () => $('textarea[name="post_content"]').length > 0;
    const isNoMonaco = () => document.location.href.indexOf('noMonaco') > 0;

    setInterval(() => {
        const href = document.location.href;
        if (document.instamonaco_url === href) {
            return;
        }

        document.instamonaco_url = href;

        if (!isEditor() || isNoMonaco()) {
            return;
        }

        $(document).ready(() => {
            bugRecovery();
            initialize();
        });
    }, 100);
})();

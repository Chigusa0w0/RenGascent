(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rgRengascent = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Moana = void 0;
var moana_ngavm_1 = require("./moana.ngavm");
var Moana;
(function (Moana) {
    Moana.moanaPlaceholder = "[align=center][color=silver]键入任意内容以更新预览[/color][/align]";
    function create(viewerId, initContent) {
        var _a;
        var elem = document.getElementById(viewerId);
        if (!elem)
            return;
        elem.innerHTML = "";
        var iframe = document.createElement("iframe");
        iframe.src = "../html/ngavm.html";
        iframe.id = viewerId + "-iframe";
        iframe.style.background = "#fff0cd";
        iframe.style.border = "none";
        iframe.style.height = "100%";
        iframe.style.margin = "0";
        iframe.style.padding = "0";
        iframe.style.width = "100%";
        elem.append(iframe);
        var iframeDoc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
        if (iframeDoc && iframeDoc.readyState == 'complete') {
            handleLoaded(viewerId, initContent, iframe);
        }
        else {
            iframe.addEventListener("load", function (e) { return handleLoaded(viewerId, initContent, iframe); });
        }
        if (window.__viewers === null || window.__viewers === undefined) {
            window.__viewers = {};
        }
        window.__viewers[viewerId] = iframe;
    }
    Moana.create = create;
    function handleLoaded(viewerId, initContent, iframe) {
        if (!iframe.contentWindow || !iframe.contentDocument)
            return;
        iframe.contentWindow.needReload = function () { create(viewerId, Moana.moanaPlaceholder); };
        iframe.contentWindow.viewarea = iframe;
        iframe.contentWindow.viewareaHeightOffset = 14;
        if (!initContent || initContent === "") {
            initContent = Moana.moanaPlaceholder;
        }
        iframe.contentWindow.initContent = initContent;
    }
    function changeContent(viewerId, content, isStructured) {
        var viewer = window.__viewers[viewerId];
        if (viewer !== null && viewer !== undefined) {
            if (isStructured) {
                viewer.vmStart(JSON.parse(content));
            }
            else {
                viewer.vmStart(content);
            }
        }
    }
    Moana.changeContent = changeContent;
    function getViewer(viewerId) {
        return window.__viewers[viewerId];
    }
    Moana.getViewer = getViewer;
    function injectBeforeHead(env, doc) {
        moana_ngavm_1.NgaVM.previewRoutines(env, doc);
        moana_ngavm_1.NgaVM.previewData(env, doc);
    }
    Moana.injectBeforeHead = injectBeforeHead;
    function injectAfterHead(env, doc) {
    }
    Moana.injectAfterHead = injectAfterHead;
    function injectBeforeBody(env, doc) {
        moana_ngavm_1.NgaVM.previewInitializer(env, doc);
    }
    Moana.injectBeforeBody = injectBeforeBody;
    function injectAfterBody(env, doc) {
        moana_ngavm_1.NgaVM.previewFinalizer(env, doc);
    }
    Moana.injectAfterBody = injectAfterBody;
})(Moana = exports.Moana || (exports.Moana = {}));

},{"./moana.ngavm":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewData = void 0;
var previewData = function (env, doc) {
    env.__NOW = Math.floor(Date.now() / 1000);
    env.__PROTOCOL = location.protocol;
    if (env.__PROTOCOL === "file:") {
        env.__PROTOCOL = "https:";
    }
    env.__GP = {
        _b: {
            admin: 1,
            super: 2,
            greater: 4,
            superlesser: 8,
            lesser: 16,
            normal: 32,
            topic: 64,
            reply: 128,
            vote: 256,
            comment: 512,
            search: 524288,
            voteBet: 1048576
        },
        _ub: {
            ubSecAct: 1024,
            ubSecView: 8,
            ubSecViewS: 2048,
            ubStaff: 16,
            ubMod: 4,
            ubExA: 128,
            ubExASucc: 256
        },
        _n: null,
        init: function (gbit, adck, rvrc, act, ubit, llog) {
            this._n = {
                _bit: gbit,
                admincheck: adck,
                rvrc: rvrc,
                active: act,
                userBit: ubit
            };
            this.loginlog = llog;
            for (var k in this._n) {
                this[k] = this._n[k] | 0;
                if (!this[k])
                    this[k] = 0;
            }
            for (var k in this._b)
                this[k] = this._b[k] & this._bit ? 1 : 0;
            for (var k in this._ub)
                this[k] = this._ub[k] & this.userBit ? 1 : 0;
        }
    };
    env.__IMG_BASE = env.__PROTOCOL + "//img4.nga.178.com";
    env.__IMGPATH = env.__PROTOCOL + "//img4.nga.178.com/ngabbs";
    env.__IMG_STYLE = env.__PROTOCOL + "//img4.nga.178.com/ngabbs/nga_classic";
    env.__COMMONRES_PATH = env.__PROTOCOL + "//img4.nga.178.com/common_res";
    env.__BBSURL = env.__PROTOCOL + "//ngabbs.com";
    env.__CKDOMAIN = "ngabbs.com";
    env.__LASTDOMAIN = "";
    env.__ATTACH_BASE = env.__PROTOCOL + "//img8.nga.cn";
    env.__ATTACH_BASE_UPLOAD = "img8.nga.cn";
    env.__ATTACH_BASE_UPLOAD_SEC = "img8.nga.cn";
    env.__ATTACH_BASE_VIEW = "img.nga.178.com";
    env.__ATTACH_BASE_VIEW_SEC = "img.nga.178.com";
    env.__RES_BASE = "img4.nga.178.com";
    env.__RES_BASE_SEC = "img4.nga.178.com";
    env.__STYLE = [
        ["default", env.__IMG_STYLE + "/css_default.css?7822026", env.__IMG_STYLE + "/js_color.js?7822026"],
        ["teal", env.__IMG_STYLE + "/css_default1.css?7822026", env.__IMG_STYLE + "/js_color1.js?7822026"],
        ["purp", env.__IMG_STYLE + "/css_default2.css?7822026", env.__IMG_STYLE + "/js_color2.js?7822026"],
        ["dark", env.__IMG_STYLE + "/css_default3.css?7822026", env.__IMG_STYLE + "/js_color3.js?7822026"]
    ];
    env.__SCRIPTS = {
        lib: env.__COMMONRES_PATH + "/js_commonLib.js?120870",
        common: env.__COMMONRES_PATH + "/js_commonui.js?5872161",
        forum: env.__COMMONRES_PATH + "/js_forum.js?3035942",
        commonSpec: env.__IMG_STYLE + "/js_default.js?9908869",
        bbscode: env.__COMMONRES_PATH + "/js_bbscode_core.js?1308371",
        bbscodeSpec: env.__IMG_STYLE + "/js_bbscode_smiles.js?2920965",
        md5: env.__COMMONRES_PATH + "/js_md5.js?140335",
        userItem: env.__COMMONRES_PATH + "/js_userItem.js?131056",
        highlighter: env.__COMMONRES_PATH + "/js_highlighter.js?140332",
        armory: env.__IMG_STYLE + "/js_armory.js?120685",
        read: env.__COMMONRES_PATH + "/js_read.js?3575361",
        bbscodeMd: env.__COMMONRES_PATH + "/js_bbscode_md.js?120439",
        service: "/js_service.js?778546",
        rand: 123456
    };
    (function () {
        var T = env.__SCRIPTS, eventName, header;
        T.lg = {};
        T.loading = 0;
        T.lo = {};
        T.cl = [];
        T.load = function (script, callback, charset, mode) {
            var elem = (!(mode & 1) || !header) ? doc.createElement("script") : "";
            if (!header) {
                eventName = ("readyState" in elem) ? "onreadystatechange" : "onload";
                header = doc.getElementsByTagName("head")[0];
            }
            if (script.charAt(0) == "/" || script.substr(0, 4) == "http") {
                var k = "s_" + Math.random();
                this[k] = script;
                script = k;
            }
            else if (!this[script] || this.src(script)) {
                return;
            }
            if (callback) {
                this.cl[script] = callback;
            }
            if ((mode & 2) == 0) {
                this.loading++;
                this.lg[this[script]] = (this.lg[this[script]] | 0) + 1;
            }
            if (mode & 1) {
                doc.write("<script src=\"" + this[script] + "\" type=\"text/javascript\" " + eventName + "=\"__SCRIPTS.ol(this,'" + script + "')\" onerror=\"__SCRIPTS.oe(this,event)\" " + (charset ? "charset=\"" + charset + "\"" : "charset=\"GBK\"") + "></script>");
            }
            else {
                elem.src = this[script];
                elem.type = "text/javascript";
                if (charset) {
                    elem.charset = charset;
                }
                else {
                    elem.charset = "GBK";
                }
                elem[eventName] = function () {
                    env.__SCRIPTS.ol(this, script);
                };
                elem.onerror = function (e) {
                    env.__SCRIPTS.oe(this, e);
                };
                header.insertBefore(elem, header.firstChild);
            }
        };
        T.src = function (s) {
            return false;
        };
        T.asyncLoad = function () {
            var a = arguments, x = a.length, mode;
            if (typeof a[x - 1] == "number") {
                mode = a[--x];
            }
            for (var i = 0; i < x; i++) {
                if (a[i]) {
                    this.load(a[i], typeof a[i + 1] == "function" ? a[++i] : 0, 0, mode);
                }
            }
        };
        T.el = function (msg) {
            console.log(msg);
        };
        T.syncLoad = function () {
            var a = arguments;
            a[a.length] = (a[a.length] | 0) | 1;
            a.length++;
            T.asyncLoad.apply(this, a);
        };
        T.oe = function (o, e) {
            this.el(o.src + " load error");
            if (this.loading > 0) {
                this.loading--;
            }
        };
        T.ol = function (o, n) {
            if (eventName != "onload") {
                var r = o.readyState;
                if (r && r != "loaded" && r != "complete") {
                    return;
                }
            }
            this.lo[n] = 1;
            if (this.loading > 0) {
                this.loading--;
                this.lg[o.src]--;
            }
            if (this.cl[n]) {
                setTimeout(this.cl[n]);
            }
            if (this.loading < 1) {
                while (this.cl.length) {
                    setTimeout(this.cl.shift());
                }
            }
        };
        T.wload = function (f) {
            if (this.loading < 1)
                return f();
            this.cl.push(f);
        };
    })();
    env.__GP.init(0, 0, 0, 0, 0, "");
    env.__UFIMG = false;
    env.ngaAds = {
        ignore: function () { return true; },
        bbs_ads32_gen: function () { },
        bbs_ads8_load_new: function () { },
        bbs_ads8_load_new_load: function () { },
    };
};
exports.previewData = previewData;

},{}],3:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NgaVM = void 0;
var NgaMimic = __importStar(require("./moana.ngamimic"));
var NgaVM;
(function (NgaVM) {
    NgaVM.previewRoutines = function (env, doc) {
        env.onerror = function (message, source, lineno, colno, error) {
            console.error("Uncaught Preview Frame Error:\n" + error);
            if (env.needReload)
                env.needReload();
            return true;
        };
        env.cleanup = function () {
            var _a;
            var container = doc.getElementById("postcontentandsubject0");
            if (container) {
                container.removeAttribute("class");
                var title = container.firstChild;
                if (title && title.tagName !== "h3") {
                    var h3 = doc.createElement("h3");
                    h3.id = "postsubject0";
                    title.replaceWith(h3);
                }
            }
            var signature = doc.getElementById("postsign0");
            if (signature) {
                signature.innerHTML = "";
            }
            var userbar = doc.getElementsByClassName("posterInfoLine");
            var notFirst = false;
            for (var i = userbar.length - 1; i >= 0; i--) {
                var user = userbar[i];
                if (notFirst) {
                    (_a = user.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(user);
                    continue;
                }
                else {
                    user.style.display = 'none';
                    user.innerHTML = "<a href='' id='postauthor0' class='author b'></a>";
                    notFirst = true;
                }
            }
        };
        env.setThreadTitle = function (data) {
            var _a;
            var title = doc.getElementById("title");
            if (!title)
                return;
            if ((_a = data.thread) === null || _a === void 0 ? void 0 : _a.title) {
                title.innerHTML = "\u5728 - " + data.thread.title + " - \u4E2D\u7684\u56DE\u590D NGA\u73A9\u5BB6\u793E\u533A";
            }
            else {
                title.innerHTML = "在帖子中的回复 NGA玩家社区";
            }
        };
        env.setPostTitle = function (data) {
            var _a, _b;
            var title = document.getElementById("postsubject0");
            if (!title)
                return;
            title.innerHTML = (_b = (_a = data.post) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : "";
        };
        env.setContent = function (data) {
            var _a, _b;
            var container = doc.getElementById("postcontent0");
            if (!container)
                return;
            container.innerHTML = (_b = (_a = data.post) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : "";
        };
        env.setEnv = function (data) {
            var _a, _b, _c;
            if (data.thread) {
                env.__CURRENT_FID = data.thread.fid;
                env.__CURRENT_TID = data.thread.tid;
                env.__CURRENT_STID = data.thread.stid;
                env.__SELECTED_FORUM = data.thread.fid;
            }
            else if (data.post) {
                env.__CURRENT_FID = (_a = data.post.fid) !== null && _a !== void 0 ? _a : 1;
                env.__CURRENT_TID = (_b = data.post.tid) !== null && _b !== void 0 ? _b : 1;
                env.__CURRENT_STID = 0;
                env.__SELECTED_FORUM = (_c = data.post.fid) !== null && _c !== void 0 ? _c : 1;
            }
        };
        env.setUser = function (data) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
            var userInfo = {
                "__GROUPS": {
                    "0": {
                        "0": "用户",
                        "1": 622816,
                        "2": 0
                    }
                },
                "__REPUTATIONS": {}
            };
            userInfo[(_b = (_a = data.post) === null || _a === void 0 ? void 0 : _a.uid) !== null && _b !== void 0 ? _b : 1] = {
                "uid": (_d = (_c = data.user) === null || _c === void 0 ? void 0 : _c.uid) !== null && _d !== void 0 ? _d : 0,
                "username": (_f = (_e = data.user) === null || _e === void 0 ? void 0 : _e.uname) !== null && _f !== void 0 ? _f : "某用户",
                "credit": 0,
                "medal": null,
                "reputation": "",
                "groupid": -1,
                "memberid": 0,
                "avatar": (_h = (_g = data.user) === null || _g === void 0 ? void 0 : _g._avatarUrl) !== null && _h !== void 0 ? _h : null,
                "yz": (_k = (_j = data.user) === null || _j === void 0 ? void 0 : _j.activeLevel) !== null && _k !== void 0 ? _k : 4,
                "site": (_m = (_l = data.user) === null || _l === void 0 ? void 0 : _l.fieldName) !== null && _m !== void 0 ? _m : null,
                "honor": null,
                "regdate": (_p = (_o = data.user) === null || _o === void 0 ? void 0 : _o.time) !== null && _p !== void 0 ? _p : 1600000000,
                "mute_time": (_r = (_q = data.user) === null || _q === void 0 ? void 0 : _q.globalMuteTime) !== null && _r !== void 0 ? _r : 0,
                "postnum": (_t = (_s = data.user) === null || _s === void 0 ? void 0 : _s.postcnt) !== null && _t !== void 0 ? _t : 100,
                "rvrc": (_v = (_u = data.user) === null || _u === void 0 ? void 0 : _u.credit) !== null && _v !== void 0 ? _v : 10,
                "money": (_x = (_w = data.user) === null || _w === void 0 ? void 0 : _w.gold) !== null && _x !== void 0 ? _x : 10000,
                "thisvisit": (_z = (_y = data.user) === null || _y === void 0 ? void 0 : _y.lastSeenTime) !== null && _z !== void 0 ? _z : 1600000000,
                "signature": (_1 = (_0 = data.user) === null || _0 === void 0 ? void 0 : _0.signature) !== null && _1 !== void 0 ? _1 : null,
                "nickname": null,
                "bit_data": 34873856
            };
            userInfo.__REPUTATIONS[(_3 = (_2 = data.post) === null || _2 === void 0 ? void 0 : _2.fid) !== null && _3 !== void 0 ? _3 : 1] = {
                "0": "版面声望"
            };
            userInfo.__REPUTATIONS[(_5 = (_4 = data.post) === null || _4 === void 0 ? void 0 : _4.fid) !== null && _5 !== void 0 ? _5 : 1][(_7 = (_6 = data.post) === null || _6 === void 0 ? void 0 : _6.uid) !== null && _7 !== void 0 ? _7 : 1] = 0;
            env.commonui.userInfo.setAll(userInfo);
        };
        env.setDefault = function (data) {
            var _a, _b, _c, _d, _e, _f;
            env.commonui.postArg.setDefault((_b = (_a = data.post) === null || _a === void 0 ? void 0 : _a.fid) !== null && _b !== void 0 ? _b : 1, 0, (_d = (_c = data.post) === null || _c === void 0 ? void 0 : _c.tid) !== null && _d !== void 0 ? _d : 1, (_f = (_e = data.post) === null || _e === void 0 ? void 0 : _e.uid) !== null && _f !== void 0 ? _f : 1, "36", "", "", "", "");
        };
        env.setAlter = function (data) {
            var _a, _b;
            env.commonui.loadAlertInfo((_b = (_a = data.post) === null || _a === void 0 ? void 0 : _a.alterinfo) !== null && _b !== void 0 ? _b : "", "alertc0");
        };
        env.setRender = function (data) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            env.commonui.postArg.proc((_b = (_a = data.post) === null || _a === void 0 ? void 0 : _a.floor) !== null && _b !== void 0 ? _b : 0, env.$("postcontainer0"), env.$("postsubject0"), env.$("postcontent0"), env.$("postsign0"), env.$("posterinfo0"), env.$("postInfo0"), null, null, null, (_d = (_c = data.post) === null || _c === void 0 ? void 0 : _c.pid) !== null && _d !== void 0 ? _d : 1, (_f = (_e = data.post) === null || _e === void 0 ? void 0 : _e.attribute) !== null && _f !== void 0 ? _f : 0, null, (_h = (_g = data.post) === null || _g === void 0 ? void 0 : _g.uid) !== null && _h !== void 0 ? _h : 1, (_k = (_j = data.post) === null || _j === void 0 ? void 0 : _j.time) !== null && _k !== void 0 ? _k : 1600000000, "0,0,0", "21", "", "", (_m = (_l = data.post) === null || _l === void 0 ? void 0 : _l.client) !== null && _m !== void 0 ? _m : "", null, null, 0);
        };
        env.rewriteLink = function () {
            var links = doc.getElementsByTagName("a");
            for (var i = links.length - 1; i >= 0; i--) {
                var link = links[i];
                var href = link.getAttribute("href");
                if ((href == null) || (href === "")) {
                    continue;
                }
                if ((!href.startsWith("about:")) && (!href.startsWith("javascript:")) && (!href.startsWith("#"))) {
                    link.target = "_blank";
                    if (href.startsWith("/")) {
                        link.href = "https://ngabbs.com" + href;
                    }
                }
            }
        };
        env.removeUnused = function (data) {
            var _a, _b, _c, _d;
            var links = doc.getElementsByTagName("a");
            for (var i = links.length - 1; i >= 0; i--) {
                var link = links[i];
                if ((link.href === "javascript:void(0)") && ((link.title === "收藏") || (link.title === "操作菜单"))) {
                    if (!link.parentNode)
                        continue;
                    link.parentNode.removeChild(link);
                }
            }
            var poster = doc.querySelectorAll("#posterinfo0");
            for (var i = poster.length - 1; i >= 0; i--) {
                var posterInfo = poster[i].parentElement;
                if (!posterInfo)
                    continue;
                posterInfo.style.display = (!data.user) ? "none" : "";
            }
            var postInfo = doc.getElementById("postInfo0");
            if (postInfo) {
                postInfo.style.display = (!((_a = data.post) === null || _a === void 0 ? void 0 : _a.time)) ? "none" : "";
            }
            var postContent = doc.getElementById("postcontentandsubject0");
            if (postContent === null || postContent === void 0 ? void 0 : postContent.firstChild) {
                postContent.firstChild.style.display =
                    (!((_b = data.post) === null || _b === void 0 ? void 0 : _b.upvote) && !((_c = data.post) === null || _c === void 0 ? void 0 : _c.downvote) && !((_d = data.post) === null || _d === void 0 ? void 0 : _d.title)) ? "none" : "";
            }
        };
        env.resizeParentDebounce = 0;
        env.resizeParent = function () {
            clearTimeout(env.resizeParentDebounce);
            env.resizeParentDebounce = env.setTimeout(function () {
                if (!env.viewarea || !env.viewareaHeightOffset)
                    return;
                var height = doc.body.scrollHeight;
                var outHeight = height + env.viewareaHeightOffset;
                env.viewarea.height = outHeight.toString();
            }, 100);
        };
        env.render = function (data) {
            env.cleanup();
            env.setThreadTitle(data);
            env.setContent(data);
            env.setUser(data);
            env.setDefault(data);
            env.setRender(data);
            env.removeUnused(data);
            env.rewriteLink();
            env.resizeParent();
        };
        env.vmStart = function (data) {
            try {
                var rendering_1;
                if (typeof (data) === "string") {
                    var tmp = {};
                    tmp.post = {};
                    tmp.post.content = data
                        .replace(/\&/g, "&amp;")
                        .replace(/\"/g, "&quot;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;")
                        .replace(/\$/g, "&#36").replace(/\'/g, "&#39;").replace(/\\/g, "&#92;")
                        .replace(/\t/g, "&emsp;&emsp;").replace(/\n/g, "<br/>").replace(/\r/g, "");
                    rendering_1 = tmp;
                }
                else {
                    rendering_1 = data;
                }
                var scroll_1 = env.scrollY || 0;
                if (doc.readyState === "complete") {
                    env.render(rendering_1);
                }
                else {
                    doc.onreadystatechange = function () {
                        if (doc.readyState === "complete") {
                            env.render(rendering_1);
                        }
                    };
                }
                env.scrollTo(0, scroll_1);
                return false;
            }
            catch (e) {
                console.error(e);
                return true;
            }
        };
        if (env.viewarea) {
            env.viewarea.vmStart = env.vmStart;
            env.vmStart(env.initContent);
        }
    };
    NgaVM.previewData = function (env, doc) {
        NgaMimic.previewData(env, doc);
    };
    NgaVM.previewInitializer = function (env, doc) {
        env.commonui = Object.defineProperties(env.commonui ? env.commonui : {}, {
            "avatarUrl": {
                value: function (y, uid) {
                    var i = y.match(/^\.a\/(\d+)_(\d+)\.(jpg|png|gif)\?(\d+)/);
                    if (i) {
                        y = env.__AVATAR_BASE_VIEW +
                            "/" +
                            ("000000000" + parseInt(i[1], 10).toString(16)).replace(/.+?([0-9a-z]{3})([0-9a-z]{3})([0-9a-z]{3})$/, "$3/$2/$1") +
                            ("/" + i[1] + "_" + i[2] + "." + i[3] + "?" + i[4]);
                    }
                    else if (y.match(/^https?:\/\/([^\/]+)\//)) {
                    }
                    else if (y) {
                        y = env.__IMGPATH + "/face/" + y;
                    }
                    else {
                        y = "";
                    }
                    if (this.correctAttachUrl) {
                        y = this.correctAttachUrl(y);
                    }
                    return y;
                },
                writable: false
            },
            "postDispCalcContentLength": {
                value: function () {
                    return 21;
                },
                writable: false
            }
        });
        env.commonui.posterInfo = Object.defineProperties(env.commonui.posterInfo ? env.commonui.posterInfo : {}, {
            "avatar": {
                value: function (i, lite, avatar, buff, at, uid) {
                    if (typeof (lite) === "string") {
                        lite = parseInt(lite, 10);
                    }
                    if (lite === 0) {
                        lite = 2;
                    }
                    avatar = this.c.selectUserPortrait(avatar, buff, uid);
                    if (!avatar) {
                        if (lite & 8) {
                            return "<div class='avatar avatar_none " + ((lite & 1) ? "avatar_small" : "") + "'></div>";
                        }
                        return "";
                    }
                    if (lite & 1) {
                        return "<img src=\"" + avatar.replace(/http:\/\/pic1\.178\.com\/avatars\/(\d+)\/(\d+)\/(\d+)\/(\d+)_(\d+)\.jpg/ig, "http://pic1.178.com/avatars/$1/$2/$3/25_$5.jpg") + "\" id=\"posteravatar" + i + "\" class=\"avatar avatar_small" + (avatar.noborder ? " avatar_noborder" : "") + "\"/>" + ((at && at.sp && at.sp[3]) ? " <img src='" + env.__IMG_STYLE + "/" + at.sp[3] + "' style='vertical-align:bottom'/>" : "");
                    }
                    else if (lite & 2) {
                        if (avatar.func) {
                            return "<img src=\"" + avatar + "\" id=\"posteravatar" + i + "\" class=\"avatar" + (avatar.noborder ? " avatar_noborder" : "") + "\" style=\"display:none;max-width:180px;max-height:255px\" onload=\"commonui.posterInfo['" + avatar.func + "'](this)\"/>";
                        }
                        return "<img src=\"" + avatar + "\" id=\"posteravatar" + i + "\" style=\"max-width:180px;max-height:255px\" class=\"avatar" + (avatar.noborder ? " avatar_noborder" : "") + "\"/>" + ((at && at.sp && at.sp[3]) ? "<img src='" + env.__IMG_STYLE + "/" + at.sp[3] + "' style='display:none' onload='this.style.marginLeft=this.style.marginRight=\"-\"+this.width/2+\"px\";this.style.display=\"\"'/>" : "");
                    }
                    return "";
                },
                writable: false
            }
        });
    };
    NgaVM.previewFinalizer = function (env, doc) {
        env.ubbcode.copyChk = function () { };
        env.ubbcode.decrypt = function (pass, txt, cC, argsId) {
            if (!pass)
                return alert("请输入密码");
            txt = env.ubbcode.crypt.rc4(pass, env.ubbcode.crypt.e(txt));
            txt = txt.replace(/\n/g, "<br/>").replace(/\r/g, "").replace(/\[crypt\]/g, "");
            cC.style.display = "none";
            cC.innerHTML = txt;
            if (argsId && env.ubbcode.bbscodeConvArgsSave[argsId]) {
                env.ubbcode.bbscodeConvArgsSave[argsId].c = cC;
                env.ubbcode.bbscodeConvArgsSave[argsId].txt = null;
                env.ubbcode.bbsCode(env.ubbcode.bbscodeConvArgsSave[argsId]);
                cC.style.display = "";
            }
        };
        env.commonui.postBtn.allBtn = function () { };
        env.commonui.postBtnLite = function () { };
        env.commonui.favor = function () { };
        env.commonui.postScoreAdd = function () { };
        env.commonui.crossDomainCall.setCallBack("iframeReadNoScrollInit", function () { });
        env.commonui.crossDomainCall.setCallBack("iframeReadNoScroll", function () { });
        var resizeObserver = new ResizeObserver(function (entries) {
            env.resizeParent();
        });
        resizeObserver.observe(doc.body);
        env.resizeParent();
    };
})(NgaVM = exports.NgaVM || (exports.NgaVM = {}));

},{"./moana.ngamimic":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BBAdapter = void 0;
var monaco_editor_1 = require("./monaco.editor");
var morula_bbsyntax_1 = require("./morula.bbsyntax");
var BBAdapter;
(function (BBAdapter) {
    var AdaptionService = (function () {
        function AdaptionService() {
            this.renderdelay = 0;
            this.inputBufferDelay = 50;
        }
        AdaptionService.prototype.convertToMarker = function (model, notice) {
            var startIdx = notice.range.index;
            var endIdx = startIdx + notice.range.length;
            var startPos = model.getPositionAt(startIdx);
            var endPos = model.getPositionAt(endIdx);
            var level = 0;
            switch (notice.level) {
                case morula_bbsyntax_1.BBSyntax.NoticeLevel.Error:
                    level = monaco_editor_1.monaco.MarkerSeverity.Error;
                    break;
                case morula_bbsyntax_1.BBSyntax.NoticeLevel.Warning:
                    level = monaco_editor_1.monaco.MarkerSeverity.Warning;
                    break;
                case morula_bbsyntax_1.BBSyntax.NoticeLevel.Message:
                    level = monaco_editor_1.monaco.MarkerSeverity.Info;
                    break;
                case morula_bbsyntax_1.BBSyntax.NoticeLevel.Success:
                    level = monaco_editor_1.monaco.MarkerSeverity.Hint;
                    break;
            }
            return {
                startLineNumber: startPos.lineNumber,
                startColumn: startPos.column,
                endLineNumber: endPos.lineNumber,
                endColumn: endPos.column,
                message: notice.message,
                severity: level
            };
        };
        AdaptionService.prototype.refreshSyntax = function (editor) {
            var model = editor.getModel();
            if (!model)
                return;
            var syntax = new morula_bbsyntax_1.BBSyntax.SyntaxChecker(editor.getValue());
            var token = syntax.tokenPass();
            var scope = syntax.scopePass(token);
            var tree = syntax.treePass(scope);
            var args = syntax.argsPass(tree);
            var errors = syntax.findings;
            var markers = [];
            for (var i = 0; i < errors.length; i++) {
                markers.push(this.convertToMarker(model, errors[i]));
            }
            monaco_editor_1.monaco.editor.setModelMarkers(model, "rengascent", markers);
        };
        AdaptionService.prototype.registerService = function (editor) {
            var _this = this;
            var model = editor.getModel();
            if (!model)
                return;
            model.onDidChangeContent(function (e) {
                clearTimeout(_this.renderdelay);
                _this.renderdelay = window.setTimeout(function () {
                    _this.refreshSyntax(editor);
                }, _this.inputBufferDelay);
            });
        };
        AdaptionService.prototype.finialize = function (editor) {
            var model = editor.getModel();
            if (!model)
                return;
            model.setEOL(monaco_editor_1.monaco.editor.EndOfLineSequence.LF);
        };
        return AdaptionService;
    }());
    BBAdapter.AdaptionService = AdaptionService;
})(BBAdapter = exports.BBAdapter || (exports.BBAdapter = {}));

},{"./monaco.editor":6,"./morula.bbsyntax":8}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BBSemantic = void 0;
var monaco_editor_1 = require("./monaco.editor");
var rengascent_env_1 = require("./rengascent.env");
var BBSemantic;
(function (BBSemantic) {
    var BBCodeLink = (function () {
        function BBCodeLink(range, url) {
            this.range = range;
            this.url = url;
        }
        return BBCodeLink;
    }());
    var bbcodeConfOverride = {
        autoClosingBrackets: "always",
        autoIndent: "keep",
        autoSurround: "brackets",
        copyWithSyntaxHighlighting: false,
        detectIndentation: false,
        insertSpaces: true,
        renderWhitespace: "all"
    };
    var bbcodeTokenizer = {
        defaultToken: "",
        tokenPostfix: ".bbcode",
        tokenizer: {
            root: [
                [/(\[)(code)/, [{ token: "delimiter" }, { token: "tag", next: "@code" }]],
                [/(\[)(crypt)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter", next: "@crypt" }]],
                [/(\[)(img|album|iframe)(=?)([^\]]*)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "abstract" }, { token: "delimiter", next: "@image" }]],
                [/(\[)(url|flash|tid|pid|dice|urlreplace)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter", next: "@image" }]],
                [/(\[)(markdown)(\])/, [{ token: "delimiter" }, { token: "bug" }, { token: "delimiter" }]],
                [/(\[)(comment\b)(.*?)(\])/, [{ token: "delimiter" }, { token: "comment" }, { token: "comment" }, { token: "delimiter" }]],
                [/(\[)(color)(=)(\w+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "$5" }, { token: "delimiter" }]],
                [/(\[)(url)(=)([^\]]+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "reference" }, { token: "delimiter" }]],
                [/(\[)(collapse)(=)([^\]]+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "abstract" }, { token: "delimiter" }]],
                [/(\[)(@)([^\]]+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "abstract" }, { token: "delimiter" }]],
                [/(\[)(fixsize|style)/, [{ token: "delimiter" }, { token: "tag", next: "@style" }]],
                [/(-|=){3,}/, { token: "tag" }],
                [/(\[)(\*)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter" }]],
                [/(\[)(\w+)(=)/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators", next: "@value" }]],
                [/(\[)(\w+)(?=[\]\s])/, [{ token: "delimiter" }, { token: "tag", next: "@param" }]],
                [/(\[\/)(\w+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter" }]],
                [/<br\s*\/?>/, { token: "metatag" }],
                [/&(#\d+|nbsp|lt|gt|quot|amp);/, { token: "metatag" }],
            ],
            code: [
                [/=/, { token: "operators", next: "@codeTyped" }],
                [/\]/, { token: "delimiter", next: "@crypt" }],
                [/(\[\/)(code)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter", next: "@pop" }]]
            ],
            codeTyped: [
                [/(\w+)(\])/, [{ token: "attribute.value" }, { token: "delimiter", next: "@codeEmbedded", nextEmbedded: "$1" }]],
                [/\[\/code\]/, { token: "@rematch", next: "@pop" }]
            ],
            codeEmbedded: [
                [/\[\/code/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
                [/[^\[\<]+/, { token: "" }]
            ],
            crypt: [
                [/<br\s*\/?>/, { token: "bug" }],
                [/(\[\/)(crypt|code)(\])/, { token: "@rematch", next: "@pop" }],
                [/[^\[\<]+/, { token: "comment" }],
                [/[\[\<]/, { token: "comment" }],
            ],
            image: [
                [/[^\[\]]+/, { token: "reference" }],
                [/(\[\/)(img|album|iframe|url|flash|tid|pid|dice|urlreplace)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter", next: "@pop" }]],
            ],
            style: [
                [/(height|width|background|rotate|scale|margin|padding|clear|float|top|bottom|left|right|align|width|height|border-radius|line-height|font|src|background|color|dybg|innerHTML|parentfitwidth)/, { token: "attribute.name" }],
                [/[^\s\]]+/, { token: "attribute.value" }],
                [/\]/, { token: "delimiter", next: "@pop" }],
            ],
            value: [
                [/[^\]]+/, { token: "attribute.value" }],
                [/\]/, { token: "delimiter", next: "@pop" }],
            ],
            param: [
                [/(\w+)(=)/, [{ token: "attribute.name" }, { token: "operators" }]],
                [/[^\s\]]+/, { token: "attribute.value" }],
                [/\]/, { token: "delimiter", next: "@pop" }],
            ],
        },
    };
    var bbcodeTheme = {
        base: "vs",
        inherit: true,
        colors: {
            'editor.background': rengascent_env_1.Environment.getSiteTheme().themeColor,
        },
        rules: [
            { token: "abstract.bbcode", foreground: "a31515" },
            { token: "attribute.name.bbcode", foreground: "6f42c1" },
            { token: "attribute.value.bbcode", foreground: "005cc5" },
            { token: "comment.bbcode", foreground: "008000" },
            { token: "delimiter.bbcode", foreground: "d93a49" },
            { token: "metatag.bbcode", foreground: "005cc5" },
            { token: "operators.bbcode", foreground: "6f42c1" },
            { token: "reference.bbcode", foreground: "6a737d" },
            { token: "tag.bbcode", foreground: "d93a49" },
            { token: "bug.bbcode", foreground: "ff1493", fontStyle: "bold" },
            { token: "skyblue.bbcode", foreground: "87ceeb", fontStyle: "bold" },
            { token: "royalblue.bbcode", foreground: "4169e1", fontStyle: "bold" },
            { token: "blue.bbcode", foreground: "0066bb", fontStyle: "bold" },
            { token: "darkblue.bbcode", foreground: "00008b", fontStyle: "bold" },
            { token: "orange.bbcode", foreground: "a06700", fontStyle: "bold" },
            { token: "orangered.bbcode", foreground: "ff4500", fontStyle: "bold" },
            { token: "crimson.bbcode", foreground: "dc143c", fontStyle: "bold" },
            { token: "red.bbcode", foreground: "dd0000", fontStyle: "bold" },
            { token: "firebrick.bbcode", foreground: "b22222", fontStyle: "bold" },
            { token: "darkred.bbcode", foreground: "8b0000", fontStyle: "bold" },
            { token: "green.bbcode", foreground: "3d9f0e", fontStyle: "bold" },
            { token: "limegreen.bbcode", foreground: "32cd32", fontStyle: "bold" },
            { token: "seagreen.bbcode", foreground: "2e8b57", fontStyle: "bold" },
            { token: "teal.bbcode", foreground: "008080", fontStyle: "bold" },
            { token: "deeppink.bbcode", foreground: "ff1493", fontStyle: "bold" },
            { token: "tomato.bbcode", foreground: "ff6347", fontStyle: "bold" },
            { token: "coral.bbcode", foreground: "ff7f50", fontStyle: "bold" },
            { token: "purple.bbcode", foreground: "800080", fontStyle: "bold" },
            { token: "indigo.bbcode", foreground: "4b0082", fontStyle: "bold" },
            { token: "burlywood.bbcode", foreground: "deb887", fontStyle: "bold" },
            { token: "sandybrown.bbcode", foreground: "f4a460", fontStyle: "bold" },
            { token: "chocolate.bbcode", foreground: "d2691e", fontStyle: "bold" },
            { token: "sienna.bbcode", foreground: "a0522d", fontStyle: "bold" },
            { token: "silver.bbcode", foreground: "888888", fontStyle: "bold" },
            { token: "gray.bbcode", foreground: "555555", fontStyle: "bold" },
            { token: "bgskyblue.bbcode", foreground: "87ceeb", fontStyle: "bold" },
            { token: "bgroyalblue.bbcode", foreground: "4169e1", fontStyle: "bold" },
            { token: "bgblue.bbcode", foreground: "0000ff", fontStyle: "bold" },
            { token: "bgdarkblue.bbcode", foreground: "00008b", fontStyle: "bold" },
            { token: "bgorange.bbcode", foreground: "ffa500", fontStyle: "bold" },
            { token: "bgorangered.bbcode", foreground: "ff4500", fontStyle: "bold" },
            { token: "bgcrimson.bbcode", foreground: "dc143c", fontStyle: "bold" },
            { token: "bgred.bbcode", foreground: "ff0000", fontStyle: "bold" },
            { token: "bgfirebrick.bbcode", foreground: "b22222", fontStyle: "bold" },
            { token: "bgdarkred.bbcode", foreground: "8b0000", fontStyle: "bold" },
            { token: "bggreen.bbcode", foreground: "008000", fontStyle: "bold" },
            { token: "bglimegreen.bbcode", foreground: "32cd32", fontStyle: "bold" },
            { token: "bgseagreen.bbcode", foreground: "2e8b57", fontStyle: "bold" },
            { token: "bgteal.bbcode", foreground: "008080", fontStyle: "bold" },
            { token: "bgdeeppink.bbcode", foreground: "ff1493", fontStyle: "bold" },
            { token: "bgtomato.bbcode", foreground: "ff6347", fontStyle: "bold" },
            { token: "bgcoral.bbcode", foreground: "ff7f50", fontStyle: "bold" },
            { token: "bgpurple.bbcode", foreground: "800080", fontStyle: "bold" },
            { token: "bgindigo.bbcode", foreground: "4b0082", fontStyle: "bold" },
            { token: "bgburlywood.bbcode", foreground: "deb887", fontStyle: "bold" },
            { token: "bgsandybrown.bbcode", foreground: "f4a460", fontStyle: "bold" },
            { token: "bgchocolate.bbcode", foreground: "d2691e", fontStyle: "bold" },
            { token: "bgsienna.bbcode", foreground: "a0522d", fontStyle: "bold" },
            { token: "bgsilver.bbcode", foreground: "c0c0c0", fontStyle: "bold" },
            { token: "bggray.bbcode", foreground: "808080", fontStyle: "bold" },
        ]
    };
    var bbcodeLang = {
        surroundingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: "<", close: ">" },
            { open: "'", close: "'" },
            { open: '"', close: '"' },
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: "'", close: "'" },
            { open: '"', close: '"' },
        ],
    };
    var bbcodeLink = {
        provideLinks: function (model, token) {
            var links = [];
            var count = model.getLineCount();
            var picRegex = /(?<!\w)\.\/mon_20\d{4}\/\d+\/[\w\-\.]+\.(png|jpg|jpeg|bmp|svg|gif)/g;
            var siteRegex = /(?<!\w)\/(thread|read|post|nuke)\.php\?([\w\-\&\=\%\#]+)/g;
            var atRegex = /\[@(.{2,20}?)\]/g;
            var idRegex = /\[(uid|pid|tid|stid|fid)[=\]](-?\d+)(.*?)\[\/\1\]/g;
            var urlRegex = /\bhttps?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
            var currentServer = location.protocol + "//" + location.host;
            for (var i = 1; i <= count; i++) {
                var text = model.getLineContent(i);
                var match = null;
                while ((match = picRegex.exec(text)) !== null) {
                    var range = new monaco_editor_1.monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    links.push(new BBCodeLink(range, match[0].replace("./mon_20", "https://img.nga.178.com/attachments/mon_20")));
                }
                while ((match = siteRegex.exec(text)) !== null) {
                    var range = new monaco_editor_1.monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    links.push(new BBCodeLink(range, currentServer + match[0]));
                }
                while ((match = atRegex.exec(text)) !== null) {
                    var range = new monaco_editor_1.monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    var uidAt = match[0].match(/^(?:UID)?(\d+)$/);
                    var selector = (uidAt !== null) ? "uid=" + uidAt[1] : "username=" + encodeURIComponent(match[0]);
                    links.push(new BBCodeLink(range, currentServer + "/nuke.php?func=ucp&__inchst=UTF-8&" + selector));
                }
                while ((match = idRegex.exec(text)) !== null) {
                    var range = new monaco_editor_1.monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    var url = currentServer;
                    switch (match[1]) {
                        case "tid":
                            url += "/read.php?tid=" + match[2];
                            break;
                        case "pid":
                            url += "/read.php?pid=" + match[2] + "&opt=128";
                            break;
                        case "uid":
                            url += "/nuke.php?uid=" + match[2] + "&func=ucp";
                            break;
                        case "stid":
                            url += "/thread.php?stid=" + match[2];
                            break;
                        case "fid":
                            url += "/thread.php?fid=" + match[2];
                            break;
                    }
                    links.push(new BBCodeLink(range, url));
                }
                while ((match = urlRegex.exec(text)) !== null) {
                    var range = new monaco_editor_1.monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    links.push(new BBCodeLink(range, match[0]));
                }
            }
            return { links: links };
        },
        resolveLink: function (link, token) {
            if (link.url) {
                if (link.url instanceof monaco_editor_1.monaco.Uri) {
                    link.url = link.url.toString();
                }
                var index = link.url.indexOf("[");
                if (index > 0) {
                    link.url = link.url.substring(0, index);
                }
            }
            return link;
        }
    };
    function registerBbcode() {
        monaco_editor_1.monaco.languages.register({ id: "bbcode" });
        monaco_editor_1.monaco.languages.setMonarchTokensProvider("bbcode", bbcodeTokenizer);
        monaco_editor_1.monaco.languages.setLanguageConfiguration("bbcode", bbcodeLang);
        monaco_editor_1.monaco.languages.registerLinkProvider("bbcode", bbcodeLink);
        monaco_editor_1.monaco.editor.defineTheme("bbcode", bbcodeTheme);
        return bbcodeConfOverride;
    }
    BBSemantic.registerBbcode = registerBbcode;
})(BBSemantic = exports.BBSemantic || (exports.BBSemantic = {}));

},{"./monaco.editor":6,"./rengascent.env":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monaco = void 0;
exports.monaco = void 0;
Object.defineProperty(exports, "monaco", {
    get: function () {
        return window.monaco;
    }
});

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Monaco = exports.monaco = void 0;
var monaco_editor_1 = require("./monaco.editor");
var monaco_bbsemantic_1 = require("./monaco.bbsemantic");
var monaco_bbadapter_1 = require("./monaco.bbadapter");
exports.monaco = monaco_editor_1.monaco;
var Monaco;
(function (Monaco) {
    function create(editorId, language, readOnly, initContent) {
        var bbcodeConfOverride = monaco_bbsemantic_1.BBSemantic.registerBbcode();
        var bbAdapter = new monaco_bbadapter_1.BBAdapter.AdaptionService();
        var confOverride = {};
        if (language === "bbcode") {
            confOverride = bbcodeConfOverride;
        }
        var elem = document.getElementById(editorId);
        if (elem === null)
            return;
        elem.innerHTML = "";
        var conf = {
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
        var editor = monaco_editor_1.monaco.editor.create(elem, conf);
        bbAdapter.refreshSyntax(editor);
        bbAdapter.registerService(editor);
        bbAdapter.finialize(editor);
        if (window.__editors === null || window.__editors === undefined) {
            window.__editors = {};
        }
        window.__editors[editorId] = editor;
    }
    Monaco.create = create;
    function changeContent(editorId, content) {
        var editor = window.__editors[editorId];
        if (editor !== null && editor !== undefined) {
            editor.executeEdits('monaco', [{
                    range: new monaco_editor_1.monaco.Range(1, 1, 2147483647, 1),
                    text: content,
                    forceMoveMarkers: false
                }]);
        }
    }
    Monaco.changeContent = changeContent;
    function updateContent(editorId, content) {
        var _a, _b, _c, _d, _e;
        var editor = window.__editors[editorId];
        if (editor !== null && editor !== undefined) {
            var model = editor.getModel();
            if (!model)
                return;
            var currentPosition = (_c = (_b = (_a = editor.getSelection()) === null || _a === void 0 ? void 0 : _a.getStartPosition()) !== null && _b !== void 0 ? _b : editor.getPosition()) !== null && _c !== void 0 ? _c : new monaco_editor_1.monaco.Position(1, 1);
            var currentIndex = model.getOffsetAt(currentPosition);
            editor.pushUndoStop();
            editor.executeEdits('monaco', [{
                    range: (_d = editor.getSelection()) !== null && _d !== void 0 ? _d : posToRange((_e = editor.getPosition()) !== null && _e !== void 0 ? _e : new monaco_editor_1.monaco.Position(1, 1)),
                    text: content,
                    forceMoveMarkers: false
                }]);
            var targetPosition = model.getPositionAt(currentIndex + content.length);
            editor.setPosition(targetPosition);
        }
    }
    Monaco.updateContent = updateContent;
    function fetchContent(editorId) {
        var editor = window.__editors[editorId];
        if (editor !== null && editor !== undefined) {
            return editor.getValue();
        }
        return "";
    }
    Monaco.fetchContent = fetchContent;
    function getEditor(editorId) {
        return window.__editors[editorId];
    }
    Monaco.getEditor = getEditor;
    function posToRange(pos) {
        return new monaco_editor_1.monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
    }
    ;
})(Monaco = exports.Monaco || (exports.Monaco = {}));

},{"./monaco.bbadapter":4,"./monaco.bbsemantic":5,"./monaco.editor":6}],8:[function(require,module,exports){
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BBSyntax = void 0;
var BBSyntax;
(function (BBSyntax) {
    var SyntaxChecker = (function () {
        function SyntaxChecker(text) {
            this.source = text;
            this.findings = [];
        }
        SyntaxChecker.prototype.tokenPass = function () {
            var tags;
            tags = [];
            for (;;) {
                var match = Def.tagRegex.exec(this.source);
                if (!match)
                    break;
                var tagName = match[2];
                var isClosing = match[1] === "/";
                var param = match[3];
                var index = match.index;
                var length_1 = match[0].length;
                if (Def.recognizedTags.indexOf(tagName) >= 0) {
                    var tag = this.commonParser(tagName, isClosing, param, index, length_1);
                    tags.push(tag);
                }
                else {
                    if (Def.recognizedSpecial.indexOf(tagName) < 0) {
                        this.issueUnrecognizedTag(tagName, isClosing, param, index, length_1);
                    }
                }
            }
            for (var i = 0; i < Def.recognizedRegex.length; i++) {
                for (;;) {
                    var rule = Def.recognizedRegex[i];
                    var match = rule.regex.exec(this.source);
                    if (!match)
                        break;
                    var tagName = rule.name;
                    var index = match.index;
                    var length_2 = match[0].length;
                    var tag = this.specialParser(tagName, match[0], index, length_2);
                    tags.push(tag);
                }
            }
            tags.sort(function (a, b) { return a.startAt.isBefore(b.startAt) ? -1 : 1; });
            return tags;
        };
        SyntaxChecker.prototype.scopePass = function (tags) {
            var scopes;
            var dimensions;
            var dimCurrent = 0;
            scopes = [];
            dimensions = [];
            dimensions[dimCurrent] = [];
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                var isFunctional = Def.functionTags.indexOf(tag.name) >= 0;
                var isClosing = tag.closeAt === TagClosingDesc.Closing;
                var isAtom = tag.closeAt === TagClosingDesc.Atom;
                if (isAtom) {
                    scopes.push(tag);
                    continue;
                }
                if (isFunctional && !isClosing) {
                    dimCurrent++;
                    dimensions[dimCurrent] = [];
                }
                var currentDim = dimensions[dimCurrent];
                var found = false;
                if (isClosing) {
                    for (var j = currentDim.length - 1; j >= 0; j--) {
                        if ((currentDim[j].name === tag.name) && (currentDim[j].closeAt === TagClosingDesc.Opening)) {
                            currentDim[j].closeAt = tag.startAt;
                            scopes.push(currentDim[j]);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        this.issueMismatchedPairing(tag);
                    }
                }
                else {
                    currentDim.push(tag);
                }
                if (currentDim.length === 0 || currentDim[0].closeAt) {
                    for (var j = 0; j < currentDim.length; j++) {
                        if (currentDim[j].closeAt !== TagClosingDesc.Opening)
                            continue;
                        this.issueMismatchedPairing(currentDim[j]);
                    }
                    if (dimCurrent > 0) {
                        dimCurrent--;
                    }
                    else {
                        dimensions[dimCurrent] = [];
                    }
                }
            }
            for (var i = dimCurrent; i >= 0; i--) {
                for (var j = 0; j < dimensions[i].length; j++) {
                    if (dimensions[i][j].closeAt !== TagClosingDesc.Opening)
                        continue;
                    this.issueMismatchedPairing(dimensions[i][j]);
                }
            }
            scopes.sort(function (a, b) { return a.startAt.isBefore(b.startAt) ? -1 : 1; });
            return scopes;
        };
        SyntaxChecker.prototype.treePass = function (tags) {
            var root = Tag.createRootTag(this.source);
            for (var i = 0; i < tags.length; i++) {
                root.placeChild(tags[i]);
            }
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                if (tag.parent === null || tag.parent === Tag.rootSign) {
                    Util.bug();
                }
                var parentRange = tag.parent.getInnerRange();
                var currentRange = tag.getOuterRange();
                if (!parentRange.isIncluding(currentRange)) {
                    this.issueInterlacingPairing(tag);
                }
            }
            tags.unshift(root);
            return tags;
        };
        SyntaxChecker.prototype.argsPass = function (tags) {
            var _a;
            var checker = new ConstraintChecker(this.source);
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                (_a = this.findings).push.apply(_a, checker.handle(tag));
            }
            return tags;
        };
        SyntaxChecker.prototype.commonParser = function (tagName, isClosing, param, index, length) {
            var pos = new TextRange(index, length);
            var argIdxOffset = 1 + (isClosing ? 1 : 0) + tagName.length;
            var argPos = new TextRange(index + argIdxOffset, param.length);
            var status = isClosing ? TagClosingDesc.Closing : TagClosingDesc.Opening;
            if (Def.atomTags.indexOf(tagName) >= 0) {
                status = TagClosingDesc.Atom;
            }
            var result = new Tag(tagName, param, argPos, pos, status);
            return result;
        };
        SyntaxChecker.prototype.specialParser = function (tag, text, index, length) {
            var pos = new TextRange(index, length);
            var result = new Tag(tag, text, pos, pos, TagClosingDesc.Atom);
            return result;
        };
        SyntaxChecker.prototype.issueUnrecognizedTag = function (tagName, isClosing, param, index, length) {
            var pos = new TextRange(index, length);
            var msg = Translation.tagUnrecognized(tagName);
            var notice = new Notice(NoticeLevel.Warning, pos, msg);
            this.findings.push(notice);
        };
        SyntaxChecker.prototype.issueMismatchedPairing = function (tag) {
            var msg = Translation.pairingMismatched(tag.name);
            var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            this.findings.push(notice);
        };
        SyntaxChecker.prototype.issueInterlacingPairing = function (tag) {
            if (!Util.isTextRange(tag.closeAt)) {
                Util.bug();
            }
            var msg = Translation.pairingInterlacing(tag.name);
            var notice = new Notice(NoticeLevel.Warning, tag.closeAt, msg);
            this.findings.push(notice);
        };
        return SyntaxChecker;
    }());
    BBSyntax.SyntaxChecker = SyntaxChecker;
    var Tag = (function () {
        function Tag(name, arg, argRange, startAt, closeAt) {
            this.name = name;
            this.arguments = arg;
            this.argumentRange = argRange;
            this.startAt = startAt;
            this.closeAt = closeAt || TagClosingDesc.Opening;
            this.parent = null;
            this.children = [];
        }
        Tag.createRootTag = function (text) {
            var rootRange = new TextRange(0, text.length);
            var root = new Tag("__ROOT__", "", new TextRange(0, 0), rootRange, TagClosingDesc.Atom);
            root.parent = "__ROOT__";
            return root;
        };
        Tag.prototype.getInnerRange = function () {
            if (Util.isTextRange(this.closeAt)) {
                var start = this.startAt.end();
                var end = this.closeAt.index;
                var length_3 = end - start;
                return new TextRange(start, length_3);
            }
            else if (this.closeAt === TagClosingDesc.Atom) {
                return this.startAt;
            }
            else {
                Util.bug();
            }
        };
        Tag.prototype.getOuterRange = function () {
            if (Util.isTextRange(this.closeAt)) {
                var start = this.startAt.index;
                var end = this.closeAt.end();
                var length_4 = end - start;
                return new TextRange(start, length_4);
            }
            else if (this.closeAt === TagClosingDesc.Atom) {
                return this.startAt;
            }
            else {
                Util.bug();
            }
        };
        Tag.prototype.placeChild = function (tag) {
            if (!this.getInnerRange().isIncluding(tag.startAt)) {
                return false;
            }
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].placeChild(tag)) {
                    return true;
                }
            }
            tag.parent = this;
            this.children.push(tag);
            this.children.sort(function (a, b) { return a.startAt.isBefore(b.startAt) ? -1 : 1; });
            return true;
        };
        Tag.rootSign = "__ROOT__";
        return Tag;
    }());
    BBSyntax.Tag = Tag;
    var TagClosingDesc;
    (function (TagClosingDesc) {
        TagClosingDesc[TagClosingDesc["Opening"] = 0] = "Opening";
        TagClosingDesc[TagClosingDesc["Closing"] = 1] = "Closing";
        TagClosingDesc[TagClosingDesc["Atom"] = 2] = "Atom";
    })(TagClosingDesc = BBSyntax.TagClosingDesc || (BBSyntax.TagClosingDesc = {}));
    var TextRange = (function () {
        function TextRange(index, length) {
            this.index = index;
            this.length = length;
        }
        TextRange.prototype.end = function () {
            return (this.index + this.length);
        };
        TextRange.prototype.getText = function (text) {
            return text.substring(this.index, this.end());
        };
        TextRange.prototype.isBefore = function (rhs) {
            return this.index < rhs.index;
        };
        TextRange.prototype.isStrictBefore = function (rhs) {
            return (this.end()) < rhs.index;
        };
        TextRange.prototype.isIncluding = function (rhs) {
            return (this.index <= rhs.index)
                && ((this.end()) >= (rhs.end()));
        };
        TextRange.prototype.isEqual = function (rhs) {
            return (this.index === rhs.index)
                && (this.length === rhs.length);
        };
        TextRange.prototype.popFront = function (length) {
            return new TextRange(this.index + length, this.length - length);
        };
        TextRange.prototype.takeFront = function (length) {
            return new TextRange(this.index, Math.min(this.length, length));
        };
        TextRange.prototype.lookBack = function (length) {
            return new TextRange(Math.max(this.index - length, 0), length);
        };
        return TextRange;
    }());
    BBSyntax.TextRange = TextRange;
    var Notice = (function () {
        function Notice(level, range, message) {
            this.level = level;
            this.range = range;
            this.message = message;
        }
        return Notice;
    }());
    BBSyntax.Notice = Notice;
    var NoticeLevel;
    (function (NoticeLevel) {
        NoticeLevel[NoticeLevel["Success"] = 0] = "Success";
        NoticeLevel[NoticeLevel["Message"] = 1] = "Message";
        NoticeLevel[NoticeLevel["Warning"] = 2] = "Warning";
        NoticeLevel[NoticeLevel["Error"] = 3] = "Error";
    })(NoticeLevel = BBSyntax.NoticeLevel || (BBSyntax.NoticeLevel = {}));
    var ConstraintChecker = (function () {
        function ConstraintChecker(source) {
            var _this = this;
            this.source = source;
            this.handlers = {
                "color": function (t) { return _this.handleColor(t); },
                "font": function (t) { return _this.handleFont(t); },
                "hltxt": function (t) { return _this.handleHltxt(t); },
                "i": function (t) { return _this.handleUniversalInnerLength(t, 52, true); },
                "size": function (t) { return _this.handleSize(t); },
                "sub": function (t) { return _this.handleUniversalInnerLength(t, 52, true); },
                "sup": function (t) { return _this.handleUniversalInnerLength(t, 52, true); },
                "upup": function (t) { return _this.handleUniversalInnerLength(t, 7, false); },
                "album": function (t) { return _this.handleUniversalAbstractText(t); },
                "chartradar": function (t) { return _this.handleChartradar(t); },
                "collapse": function (t) { return _this.handleUniversalAbstractText(t); },
                "crypt": function (t) { return _this.handleCrypt(t); },
                "headline": function (t) { return _this.handleHeadline(t); },
                "omit": function (t) { return _this.handleOmit(t); },
                "style": function (t) { return _this.handleStyle(t); },
                "urlreplace": function (t) { return _this.handleUniversalNotRecommended(t); },
                "cnarmory": function (t) { return _this.handleUniversalArgumentFormat(t, / [^\s]+ [^\s]+/, "[cnarmory 服务器 角色名]"); },
                "euarmory": function (t) { return _this.handleUniversalDeprecated(t); },
                "fixsize": function (t) { return _this.handleFixsize(t); },
                "markdown": function (t) { return _this.handleMarkdown(t); },
                "stripbr": function (t) { return _this.handleStripBr(t); },
                "symbol": function (t) { return _this.handleSymbol(t); },
                "twarmory": function (t) { return _this.handleUniversalDeprecated(t); },
                "usarmory": function (t) { return _this.handleUniversalDeprecated(t); },
                "comment": function (t) { return _this.handleUniversalRequireFixsize(t); },
                "lessernuke": function (t) { return _this.handleLesserNuke(t); },
                "t.178.com": function (t) { return _this.handleUniversalDeprecated(t); },
                "br": function (t) { return _this.handleBr(t); },
                "htmlentity": function (t) { return _this.handleHtmlEntity(t); },
            };
        }
        ConstraintChecker.prototype.handle = function (tag) {
            var handler = this.handlers[tag.name];
            if (handler) {
                return handler(tag);
            }
            return [];
        };
        ConstraintChecker.prototype.handleColor = function (tag) {
            var arg = tag.arguments;
            var match = arg.match(/^=(bg|)(\w+)$/);
            if (!match) {
                var msg = Translation.argumentMalformed(tag.name, "[color=颜色名]");
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            var name = match[2];
            if (Def.colorList.indexOf(name) < 0) {
                var msg = Translation.constraintColorOptionRange(name);
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            return [];
        };
        ConstraintChecker.prototype.handleFont = function (tag) {
            var arg = tag.arguments;
            var match = arg.match(/^=([\w ]+)$/);
            if (!match) {
                var msg = Translation.argumentMalformed(tag.name, "[font=字体名]");
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            var name = match[1];
            if (Def.fontList.indexOf(name) < 0) {
                var msg = Translation.constraintFontOptionRange(name);
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            return [];
        };
        ConstraintChecker.prototype.handleHltxt = function (tag) {
            if (tag.getInnerRange().getText(this.source).length > 0) {
                return [];
            }
            var msg = Translation.bugHeadlineMissingText();
            var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleSize = function (tag) {
            var arg = tag.arguments;
            var match = arg.match(/^=(\d+)%$/);
            if (!match) {
                var msg = Translation.argumentMalformed(tag.name, "[size=缩放比例%]");
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            var size = parseInt(match[1], 10);
            if (size <= 0 || size >= 1000) {
                var msg = Translation.constraintSizeOptionRange(size);
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            return [];
        };
        ConstraintChecker.prototype.handleChartradar = function (tag) {
            var msg = Translation.bugChartradarFormat();
            var notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            var msg2 = Translation.bugNotRecommended(tag.name);
            var notice2 = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice, notice2];
        };
        ConstraintChecker.prototype.handleCrypt = function (tag) {
            var msg = Translation.bugCryptNotWorking();
            var notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleHeadline = function (tag) {
            var children = tag.children;
            for (var i = 0; i < children.length; i++) {
                if (children[i].name === "hltxt") {
                    return [];
                }
            }
            var msg = Translation.bugHeadlineMissingText();
            var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleOmit = function (tag) {
            var notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }
            var inner = tag.getInnerRange().getText(this.source);
            if (inner.indexOf("[") >= 0 || inner.indexOf("]") >= 0 || inner.indexOf("<br") >= 0) {
                var msg = Translation.bugTagInOmit();
                var notice_1 = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice_1];
            }
            return [];
        };
        ConstraintChecker.prototype.handleStyle = function (tag) {
            var notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }
            var result = this.parseStyleArguments(tag, Def.styleArgument);
            var usingSrc = null;
            var usingPfw = null;
            for (var i = 0; i < result.routes.length; i++) {
                if (result.routes[i].ruleName === "src") {
                    usingSrc = result.routes[i];
                }
                if (result.routes[i].ruleName === "pfw") {
                    usingPfw = result.routes[i];
                }
            }
            if (usingSrc) {
                if (tag.children.length > 0) {
                    var msg = Translation.constraintStyleSrcNoChild();
                    var notice_2 = new Notice(NoticeLevel.Warning, usingSrc.keyRange, msg);
                    result.notices.push(notice_2);
                }
            }
            if (usingPfw) {
                if (!usingSrc) {
                    var msg = Translation.constraintStylePfwNoSrc();
                    var notice_3 = new Notice(NoticeLevel.Error, usingPfw.keyRange, msg);
                    result.notices.push(notice_3);
                }
            }
            return result.notices;
        };
        ConstraintChecker.prototype.handleFixsize = function (tag) {
            if (tag.parent === null || tag.parent === Tag.rootSign) {
                var msg = Translation.constraintFixsizeContainer();
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            if (tag.parent.name !== "collapse" && tag.parent.name !== "randomblock") {
                var msg = Translation.constraintFixsizeContainer();
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            var result = this.parseStyleArguments(tag, Def.fixsizeArgument);
            for (var i = 0; i < result.routes.length; i++) {
                if (result.routes[i].ruleName === "t1") {
                    var msg = Translation.bugFixsizeBg();
                    var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                    result.notices.push(notice);
                }
            }
            return result.notices;
        };
        ConstraintChecker.prototype.handleMarkdown = function (tag) {
            var msg = Translation.bugMarkdown();
            var notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleStripBr = function (tag) {
            var notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }
            return this.handleUniversalParamenterless(tag);
        };
        ConstraintChecker.prototype.handleSymbol = function (tag) {
            var notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }
            var match = tag.arguments.match(/ (\w+)/);
            if (!match) {
                var msg = Translation.argumentMalformed(tag.name, "[symbol 符号名]");
                var notice_4 = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice_4];
            }
            var name = match[1];
            if (Def.symbolList.indexOf(name) < 0) {
                var msg = Translation.constraintSymbolOutOfRange(name);
                var notice_5 = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice_5];
            }
            return [];
        };
        ConstraintChecker.prototype.handleLesserNuke = function (tag) {
            var msg = Translation.bugLesserNuke();
            var notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleBr = function (tag) {
            var parent = tag.parent;
            while (parent !== Tag.rootSign) {
                if (parent === null)
                    Util.bug();
                if (parent.name === "code") {
                    var msg = Translation.bugBrInCode();
                    var notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
                    return [notice];
                }
                parent = parent.parent;
            }
            return [];
        };
        ConstraintChecker.prototype.handleHtmlEntity = function (tag) {
            var entity = tag.arguments;
            var match = entity.match(/\d+/);
            if (match === null)
                Util.bug();
            var code = parseInt(match[0], 10);
            if (code > 0x7F && code < 0x4E00 || code > 0x9FA5 && code < 0x110000) {
                return [];
            }
            if (Def.entityExempt.indexOf(code) >= 0) {
                return [];
            }
            var msg = Translation.constraintEntityCodeRange(entity);
            var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleUniversalAbstractText = function (tag) {
            var abstract = tag.arguments;
            if (abstract.indexOf("[") >= 0 || abstract.indexOf("]") >= 0 || abstract.indexOf("<br") >= 0) {
                var msg = Translation.bugAbstractSuspecious(tag.name);
                var notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
                return [notice];
            }
            return [];
        };
        ConstraintChecker.prototype.handleUniversalArgumentFormat = function (tag, regex, hint) {
            var match = tag.arguments.match(regex);
            if (!match) {
                var msg = Translation.argumentMalformed(tag.name, hint);
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            return [];
        };
        ConstraintChecker.prototype.handleUniversalDeprecated = function (tag) {
            var msg = Translation.bugDeprecated(tag.name);
            var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleUniversalInnerLength = function (tag, length, considerEscape) {
            var current = tag.getInnerRange().length;
            if (considerEscape) {
                current = Def.secureText(tag.getInnerRange().getText(this.source)).length;
            }
            if (current > length) {
                var msg = Translation.constraintInnerTooLong(tag.name, length);
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            return [];
        };
        ConstraintChecker.prototype.handleUniversalNotRecommended = function (tag) {
            var msg = Translation.bugNotRecommended(tag.name);
            var notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.handleUniversalParamenterless = function (tag) {
            if (tag.arguments.length > 0) {
                var msg = Translation.argumentNotSupported(tag.name);
                var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }
            return [];
        };
        ConstraintChecker.prototype.handleUniversalRequireFixsize = function (tag) {
            var parent = tag.parent;
            while (parent !== Tag.rootSign) {
                if (parent === null)
                    Util.bug();
                if (parent.name === "collapse" || parent.name === "randomblock") {
                    for (var i = 0; i < parent.children.length; i++) {
                        if (parent.children[i].name === "fixsize") {
                            return [];
                        }
                    }
                    break;
                }
                parent = parent.parent;
            }
            var msg = Translation.constraintRequireFixsize(tag.name);
            var notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        };
        ConstraintChecker.prototype.getNextArgToken = function (str) {
            var match = str.match(/^([\s\=]*)([^\s\=]+|$)/);
            if (!match) {
                return new TokenConsumable("", str, new TextRange(0, 0), false);
            }
            var pos = new TextRange(0, match[0].length);
            return new TokenConsumable(match[2], str.substring(match[0].length), pos, match[1].indexOf("=") >= 0);
        };
        ConstraintChecker.prototype.parseStyleArguments = function (tag, desc) {
            var args = tag.arguments;
            var argRange = tag.argumentRange;
            var notices = [];
            var routes = [];
            while (args.trim().length > 0) {
                var next = this.getNextArgToken(args);
                var name_1 = next.token;
                argRange = argRange.popFront(next.consumed.length);
                args = next.newText;
                var keyRange = argRange.lookBack(name_1.length);
                if (!desc.hasOwnProperty(name_1) || next.isRhs) {
                    var msg = Translation.argumentUnknown(tag.name, name_1);
                    var notice = new Notice(NoticeLevel.Error, keyRange, msg);
                    notices.push(notice);
                    continue;
                }
                var argMatch = desc[name_1];
                var matched = false;
                for (var rule in argMatch) {
                    if (!argMatch.hasOwnProperty(rule))
                        continue;
                    var regex = "^";
                    for (var i = 0; i < argMatch[rule].length; i++) {
                        regex += "\\s+(" + argMatch[rule][i].source + ")";
                    }
                    regex += "(?=\\s|$)";
                    var matcher = new RegExp(regex);
                    var match = args.match(matcher);
                    if (match) {
                        var values = [];
                        for (var i = 0; i < argMatch[rule].length; i++) {
                            values.push(match[i + 1]);
                        }
                        var route = new ArgRoute(rule, name_1, values, keyRange);
                        routes.push(route);
                        argRange = argRange.popFront(match[0].length);
                        args = args.substring(match[0].length);
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    var msg = Translation.argumentError(tag.name, name_1);
                    var notice = new Notice(NoticeLevel.Error, keyRange, msg);
                    notices.push(notice);
                    continue;
                }
            }
            return { routes: routes, notices: notices };
        };
        return ConstraintChecker;
    }());
    var SpecialTag = (function () {
        function SpecialTag(n, r) {
            this.name = n;
            this.regex = r;
        }
        return SpecialTag;
    }());
    var Def = (function () {
        function Def() {
        }
        Def.tagNormalize = function (name) {
            var normalized = name.toLowerCase();
            if (Def.caseSensitiveTags.indexOf(normalized) >= 0) {
                return name;
            }
            return normalized;
        };
        Def.secureText = function (text) {
            return text
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;")
                .replace(/\$/g, "&#36;")
                .replace(/\x5C/g, "&#92;")
                .replace(/&lt;br *\/?&gt;/gi, "<br />");
        };
        Def.styleTags = ["align", "b", "color", "del", "font", "h", "hltxt", "i", "l", "r", "size", "sub", "sup", "u", "upup", "url"];
        Def.functionTags = [
            "album", "attach", "chartradar", "code", "collapse", "crypt", "customachieve", "dice", "flash", "headline",
            "iframe", "img", "list", "omit", "pid", "quote", "randomblock", "span", "stid", "style", "table",
            "td", "tid", "tr", "uid", "urlreplace"
        ];
        Def.atomTags = ["*", "cnarmory", "euarmory", "fixsize", "markdown", "stripbr", "symbol", "twarmory", "usarmory"];
        Def.pairedTags = __spreadArray(__spreadArray([], Def.styleTags), Def.functionTags);
        Def.recognizedTags = __spreadArray(__spreadArray([], Def.pairedTags), Def.atomTags);
        Def.specialTags = [
            new SpecialTag("at", /\[@(.{2,20}?)\]/g),
            new SpecialTag("comment", /\[\/?comment (.+?)\]/g),
            new SpecialTag("heading", /(?:(=|-){3})(.{0,100}?)(?:\1{3,})/g),
            new SpecialTag("lessernuke", /\[\/?lessernuke(\d)?\]/g),
            new SpecialTag("smile", /\[s:(.{1,10}?)\]/g),
            new SpecialTag("t.178.com", /\[t\.178\.com\/(.+?)\]/g)
        ];
        Def.codeUnits = [
            new SpecialTag("br", /<br\s*\/?>/g),
            new SpecialTag("htmlentity", /&#(\d{2,8});/g),
        ];
        Def.recognizedRegex = __spreadArray(__spreadArray([], Def.specialTags), Def.codeUnits);
        Def.recognizedSpecial = Def.recognizedRegex.map(function (x) { return x.name; });
        Def.caseSensitiveTags = __spreadArray(__spreadArray([], Def.atomTags), ["customachieve", "omit", "style"]);
        Def.tagRegex = /\[(\/?)(\w+)(-?\d+|(?=[\s=])[^\]]{0,255}|)\]/g;
        Def.entityExempt = [39, 36, 92];
        Def.symbolList = ["bad", "close", "gear", "good", "img", "label", "link", "menu", "smile", "star", "tbody", "up"];
        Def.colorList = ["blue", "burlywood", "chocolate", "coral", "crimson", "darkblue", "darkred", "deeppink",
            "firebrick", "gray", "green", "indigo", "limegreen", "orange", "orangered", "purple", "red", "royalblue", "sandybrown",
            "seagreen", "sienna", "silver", "skyblue", "teal", "tomato"];
        Def.fontList = ["simhei", "simsun", "Arial", "Arial Black", "Book Antiqua", "Century Gothic", "Comic Sans MS",
            "Courier New", "Georgia", "Impact", "Tahoma", "Times New Roman", "Trebuchet MS", "Script MT Bold", "Stencil", "Verdana",
            "Lucida Console"];
        Def.fixsizeArgument = {
            width: {
                w2: [/\d+(?:\.\d+)?/, /\d+(?:\.\d+)?/],
                w1: [/\d+(?:\.\d+)?/],
            },
            height: {
                h1: [/\d+(?:\.\d+)?/],
            },
            background: {
                t2: [/transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/, /transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/],
                t1: [/transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/],
            },
        };
        Def.styleArgument = {
            rotate: {
                p: [/-?\d+(?:\.\d+)?/],
            },
            scale: {
                p: [/\d+(?:\.\d+)?/],
            },
            margin: {
                p4: [/auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/],
                p3: [/auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/],
                p2: [/auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/],
                p1: [/auto|-?\d+(?:\.\d+)?/],
            },
            padding: {
                p4: [/auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/],
                p3: [/auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/],
                p2: [/auto|-?\d+(?:\.\d+)?/, /auto|-?\d+(?:\.\d+)?/],
                p1: [/auto|-?\d+(?:\.\d+)?/],
            },
            clear: {
                p: [/both/],
            },
            float: {
                p: [/left|right/],
            },
            top: {
                p: [/-?\d+(?:\.\d+)?/],
            },
            bottom: {
                p: [/-?\d+(?:\.\d+)?/],
            },
            left: {
                p: [/-?\d+(?:\.\d+)?/],
            },
            right: {
                p: [/-?\d+(?:\.\d+)?/],
            },
            align: {
                p: [/left|right|center|justify-all/],
            },
            width: {
                ppct: [/\d+(?:\.\d+)?\%/],
                pem: [/\d+(?:\.\d+)?/],
            },
            height: {
                ppct: [/\d+(?:\.\d+)?\%/],
                pem: [/\d+(?:\.\d+)?/],
            },
            "border-radius": {
                ppct: [/\d+(?:\.\d+)?\%/],
                pem: [/\d+(?:\.\d+)?/],
            },
            "line-height": {
                ppct: [/\d+(?:\.\d+)?\%/],
                pem: [/\d+(?:\.\d+)?/],
            },
            font: {
                pSizeColor: [/\d+(?:\.\d+)?/, /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?/],
                pSizeSerif: [/\d+(?:\.\d+)?/, /serif/],
                pSize: [/\d+(?:\.\d+)?/],
            },
            background: {
                p: [/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?/],
            },
            color: {
                p: [/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?/],
            },
            src: {
                src: [/\.\/mon_\d{6}\/\d+\/[^\]\[]+\.(?:jpg|png|svg)/],
            },
            dybg: {
                p: [new RegExp("-?\\d+(?:\\.\\d+)?\\%" + ";" +
                        "-?\\d+(?:\\.\\d+)?\\%?" + ";" +
                        "-?\\d+(?:\\.\\d+)?\\%?" + ";" +
                        "-?\\d+(?:\\.\\d+)?\\%?" + ";" +
                        "-?\\d+(?:\\.\\d+)?\\%?" + ";" +
                        "\\.\\/mon_\\d{6}\\/\\d+\\/[^\\]\\[]+\\.(?:png|jpg|jpeg|bmp|svg|gif)")]
            },
            parentfitwidth: {
                pfw: []
            }
        };
        return Def;
    }());
    var ArgRoute = (function () {
        function ArgRoute(ruleName, key, value, keyRange) {
            this.ruleName = ruleName;
            this.key = key;
            this.value = value;
            this.keyRange = keyRange;
        }
        return ArgRoute;
    }());
    var TokenConsumable = (function () {
        function TokenConsumable(token, newText, consumed, isRhs) {
            this.token = token;
            this.newText = newText;
            this.consumed = consumed;
            this.isRhs = isRhs;
        }
        return TokenConsumable;
    }());
    var Util = (function () {
        function Util() {
        }
        Util.bug = function () {
            throw new Error("unreachable");
        };
        Util.toInt = function (num) {
            if (Number.isInteger(num)) {
                return num;
            }
            if (num >= 0) {
                return Math.floor(num);
            }
            else {
                return Math.ceil(num);
            }
        };
        Util.isNotices = function (value) {
            if (value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    if (value[i] instanceof Notice) {
                        continue;
                    }
                    return false;
                }
                return true;
            }
            return false;
        };
        Util.isTag = function (value) {
            return value instanceof Tag;
        };
        Util.isTextRange = function (value) {
            return value instanceof TextRange;
        };
        Util.hasValue = function (value) {
            if ((value === null) || (value === undefined) || (value === NaN)) {
                return false;
            }
            return true;
        };
        return Util;
    }());
    var Translation = (function () {
        function Translation() {
        }
        Translation.argumentError = function (tag, arg) { return "\u6807\u7B7E " + tag + " \u7684\u4EE5\u4E0B\u53C2\u6570\u4F7F\u7528\u4E86\u975E\u6CD5\u503C: " + arg; };
        Translation.argumentMalformed = function (name, format) { return "\u6807\u7B7E " + name + " \u53C2\u6570\u683C\u5F0F\u9519\u8BEF\uFF0C\u9884\u671F: " + format; };
        Translation.argumentMissing = function (tag, arg) { return "\u6807\u7B7E " + tag + " \u7F3A\u5C11\u4EE5\u4E0B\u5FC5\u987B\u53C2\u6570: " + arg; };
        Translation.argumentNotSupported = function (tag) { return "\u6807\u7B7E " + tag + " \u4E0D\u5E94\u5177\u6709\u4EFB\u4F55\u53C2\u6570"; };
        Translation.argumentUnknown = function (tag, arg) { return "\u6807\u7B7E " + tag + " \u5305\u542B\u4E86\u4EE5\u4E0B\u672A\u77E5\u53C2\u6570\u6216\u53C2\u6570\u503C: " + arg; };
        Translation.constraintColorOptionRange = function (name) { return "\u989C\u8272 " + name + " \u4E0D\u53D7\u8BBA\u575B\u652F\u6301"; };
        Translation.constraintEntityCodeRange = function (name) { return "\u8F6C\u4E49\u5E8F\u5217 " + name + " \u4E0D\u53D7\u8BBA\u575B\u652F\u6301"; };
        Translation.constraintFixsizeContainer = function () { return "\u6807\u7B7E fixsize \u4EC5\u53EF\u5728 collapse \u6216 randomblock \u533A\u57DF\u5185\u751F\u6548"; };
        Translation.constraintFontOptionRange = function (name) { return "\u5B57\u4F53 " + name + " \u4E0D\u53D7\u8BBA\u575B\u652F\u6301"; };
        Translation.constraintInnerTooLong = function (name, length) { return "\u6807\u7B7E " + name + " \u73B0\u6709\u5185\u6587\u8FC7\u957F\uFF0C\u6700\u5927\u5141\u8BB8 " + length + " \u4E2A\u7ECF\u8F6C\u4E49\u7684\u5B57\u7B26"; };
        Translation.constraintRequireFixsize = function (name) { return "\u6807\u7B7E " + name + " \u4EC5\u53EF\u5728 fixsize \u533A\u57DF\u5185\u751F\u6548"; };
        Translation.constraintSizeOptionRange = function (name) { return "\u7F29\u653E " + name + "% \u4E0D\u53D7\u8BBA\u575B\u652F\u6301"; };
        Translation.constraintStyleSrcNoChild = function () { return "\u6807\u7B7E style \u4F7F\u7528 src \u53C2\u6570\u65F6\u4E0D\u5E94\u5305\u62EC\u5176\u4ED6\u6807\u7B7E"; };
        Translation.constraintStylePfwNoSrc = function () { return "\u6807\u7B7E style \u7684 parentfitwidth \u53C2\u6570\u4EC5\u53EF\u4E0E src \u53C2\u6570\u540C\u65F6\u4F7F\u7528"; };
        Translation.constraintSymbolOutOfRange = function (name) { return "\u7B26\u53F7\u540D " + name + " \u65E0\u6CD5\u4F5C\u4E3A symbol \u6807\u7B7E\u53C2\u6570"; };
        Translation.pairingInterlacing = function (name) { return "\u6807\u7B7E " + name + " \u7684\u5D4C\u5957\u987A\u5E8F\u5B58\u5728\u9519\u8BEF"; };
        Translation.pairingMismatched = function (name) { return "\u6807\u7B7E " + name + " \u65E0\u6CD5\u5728\u5F53\u524D\u4F5C\u7528\u57DF\u5185\u914D\u5BF9"; };
        Translation.tagUnrecognized = function (name) { return "\u672A\u77E5\u7684\u6807\u7B7E " + name; };
        Translation.bugAbstractSuspecious = function (name) { return "\u6807\u7B7E " + name + " \u7684\u63D0\u7EB2\u90E8\u5206\u53EF\u80FD\u65E0\u6CD5\u6B63\u786E\u652F\u6301\u663E\u793A\u65B9\u62EC\u53F7\u4E0E\u6362\u884C\u7B26"; };
        Translation.bugBrInCode = function () { return "\u6807\u7B7E code \u4F5C\u7528\u533A\u57DF\u5185\u7684 br \u6362\u884C\u7B26\u4ECD\u5C06\u751F\u6548"; };
        Translation.bugChartradarFormat = function () { return "\u6807\u7B7E chartradar \u4E2D\u5C5E\u6027\u6570\u503C\u5BF9\u6570\u91CF\u9519\u8BEF\u53EF\u80FD\u5F15\u8D77\u8BBA\u575B\u7F51\u9875\u4E25\u91CD\u9519\u8BEF"; };
        Translation.bugCryptNotWorking = function () { return "\u6807\u7B7E crypt \u5982\u672A\u4F7F\u7528\u4FEE\u590D\u811A\u672C\u5C06\u65E0\u6CD5\u6B63\u786E\u89E3\u5BC6"; };
        Translation.bugDeprecated = function (name) { return "\u6807\u7B7E " + name + " \u5DF2\u4E0D\u53D7\u5F53\u524D\u7248\u672C\u7684\u8BBA\u575B\u7F51\u7AD9\u652F\u6301"; };
        Translation.bugFixsizeBg = function () { return "\u6807\u7B7E fixsize \u4E2D\u4F7F\u7528\u5355\u53C2\u6570\u80CC\u666F\u8272\u8BBE\u7F6E\u53EF\u80FD\u5F15\u8D77\u8BBA\u575B\u7F51\u9875\u4E25\u91CD\u9519\u8BEF"; };
        Translation.bugHeadlineMissingText = function () { return "\u6807\u7B7E headline \u4E2D\u7F3A\u5C11 hltxt \u6807\u7B7E\u6216\u5176\u5185\u5BB9\u53EF\u80FD\u5F15\u8D77\u8BBA\u575B\u7F51\u9875\u4E25\u91CD\u9519\u8BEF"; };
        Translation.bugLesserNuke = function () { return "\u6807\u7B7E lessernuke \u4F1A\u5728\u53D1\u5E03\u65F6\u88AB\u6E05\u9664\uFF0C\u4E14\u6709\u6982\u7387\u4E3A\u60A8\u62DB\u6765\u771F\u6B63\u7684\u7981\u8A00\uFF0C\u8BF7\u4E09\u601D\u540E\u884C"; };
        Translation.bugMarkdown = function () { return "\u68C0\u6D4B\u5230 markdown \u6A21\u5F0F\uFF0C\u8BE5\u6A21\u5F0F\u4E0B\u5B58\u5728\u591A\u4E2A\u5DF2\u77E5 bug \u4E14\u4E0D\u53D7\u8BED\u6CD5\u68C0\u67E5\u5668\u652F\u6301"; };
        Translation.bugNotRecommended = function (name) { return "\u6807\u7B7E " + name + " \u5DF2\u4E0D\u63A8\u8350\u4F7F\u7528"; };
        Translation.bugTagInOmit = function () { return "\u6807\u7B7E omit \u4F5C\u7528\u533A\u57DF\u5185\u4F7F\u7528\u4EFB\u4F55\u6807\u7B7E\u5747\u5C06\u5BFC\u81F4\u5168\u6587\u663E\u793A\u9519\u8BEF"; };
        return Translation;
    }());
})(BBSyntax = exports.BBSyntax || (exports.BBSyntax = {}));

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var Environment;
(function (Environment) {
    function getSiteTheme() {
        var clrs = "#fffcee";
        if (Environment.envVariables["__COLOR"]) {
            clrs = Environment.envVariables["__COLOR"].bg0;
        }
        return {
            themeColor: clrs
        };
    }
    Environment.getSiteTheme = getSiteTheme;
    Environment.envVariables = {};
})(Environment = exports.Environment || (exports.Environment = {}));

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rengascent = void 0;
var moana_1 = require("./moana");
var monaco_1 = require("./monaco");
var rengascent_protocol_1 = require("./rengascent.protocol");
var Rengascent;
(function (Rengascent) {
    var renderdelay = 0;
    var inputBufferDelay = 100;
    function refreshPreview(model, viewerId) {
        var value = model.getValue();
        inputBufferDelay = Math.max(100, Math.min(value.length / 40, 1000));
        if (moana_1.Moana.getViewer(viewerId).vmStart) {
            moana_1.Moana.getViewer(viewerId).vmStart(value);
        }
        else {
            setTimeout(function () {
                refreshPreview(model, viewerId);
            }, 50);
        }
    }
    Rengascent.refreshPreview = refreshPreview;
    function create(editorId, viewerId, initContent) {
        monaco_1.Monaco.create(editorId, "bbcode", false, initContent);
        moana_1.Moana.create(viewerId, initContent);
        var editor = monaco_1.Monaco.getEditor(editorId);
        var model = editor.getModel();
        if (!model)
            return;
        model.onDidChangeContent(function (e) {
            clearTimeout(renderdelay);
            renderdelay = setTimeout(function () {
                refreshPreview(model, viewerId);
            }, inputBufferDelay);
        });
        rengascent_protocol_1.Protocol.createChannel(editorId, viewerId);
    }
    Rengascent.create = create;
})(Rengascent = exports.Rengascent || (exports.Rengascent = {}));

},{"./moana":1,"./monaco":7,"./rengascent.protocol":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Protocol = void 0;
var monaco_1 = require("./monaco");
var rengascent_env_1 = require("./rengascent.env");
var Protocol;
(function (Protocol) {
    function createChannel(editorId, viewerId) {
        window.addEventListener("message", function (e) {
            if (!e.origin.match(/(?:nga\.cn|ngacn\.cc|nga\.178\.com|nga\.donews\.com|ngabbs.com|bigccq\.cn|127\.0\.0\.1)(?::\d+)?$/)) {
                return;
            }
            var method;
            var callback;
            var value;
            var matches = String(e.data).match(/(\w+)\s+(\w+)\s+([^]+)/);
            if (!matches)
                return;
            method = matches[1];
            callback = matches[2];
            value = matches[3];
            if (!method || method === "null")
                return;
            if (callback === "null")
                callback = null;
            if (value === "null")
                value = null;
            if (method) {
                window.messageOrigin = e.origin;
                handleMessage(method, callback, value, editorId, viewerId);
            }
        });
        if (window.messageBuffer) {
            var msgBuf = window.messageBuffer;
            window.messageBuffer = null;
            for (var i = 0; i < msgBuf.length; i++) {
                var buf = msgBuf[i];
                handleMessage(buf.method, buf.callback, buf.value, editorId, viewerId);
            }
        }
    }
    Protocol.createChannel = createChannel;
    function pullContent(editorId) {
        sendMessage("rgEditorProbeContent", null, null);
    }
    Protocol.pullContent = pullContent;
    function pushContent(editorId) {
        sendMessage("rgEditorReciveContent", null, monaco_1.Monaco.fetchContent(editorId));
    }
    Protocol.pushContent = pushContent;
    function requestUpload() {
        throw new Error("Not Implemented");
        sendMessage("rgEditorUploadRequest", null, JSON.stringify(""));
    }
    Protocol.requestUpload = requestUpload;
    function displayDialog() {
        throw new Error("Not Implemented");
        sendMessage("rgEditorDisplayDialog", null, "");
    }
    Protocol.displayDialog = displayDialog;
    function sendMessage(method, callback, value) {
        window.parent.postMessage(method + " " + callback + " " + value, window.messageOrigin);
        console.log(method + " " + callback + " " + value);
    }
    function handleMessage(method, callback, value, editorId, viewerId) {
        var response = null;
        switch (method) {
            case "loadContentFromParentFrame":
                response = safeInvokeString(function (x) { return setContent(editorId, x); }, value);
                break;
            case "returnContentToParent":
                response = safeInvokeString(function (x) { return getContent(editorId); }, null);
                break;
            case "insertCodeFromParentFrame":
                response = safeInvokeJson(function (x) { return !!x.text; }, function (x) { return replaceTextFrag(editorId, x); }, value);
                break;
            case "setEnvironmentVariable":
                response = safeInvokeJson(function (x) { return x instanceof Object; }, function (x) { return setEnvVar(editorId, x); }, value);
                break;
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
    function safeInvokeJson(cls, fn, value) {
        var obj;
        try {
            obj = value ? JSON.parse(value) : null;
        }
        catch (e) {
            console.error(e);
            return null;
        }
        if (!cls(obj))
            return null;
        try {
            var result = fn(obj);
            return JSON.stringify(result);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    function safeInvokeString(fn, value) {
        try {
            var result = fn(value);
            return JSON.stringify(result);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    function setContent(editorId, value) {
        monaco_1.Monaco.changeContent(editorId, value || "");
        return null;
    }
    function getContent(editorId) {
        pushContent(editorId);
        return null;
    }
    function replaceTextFrag(editorId, value) {
        monaco_1.Monaco.updateContent(editorId, value.text);
        return null;
    }
    function setEnvVar(editorId, value) {
        rengascent_env_1.Environment.envVariables = value;
        return null;
    }
    var TextFragment = (function () {
        function TextFragment() {
            this.text = "";
        }
        return TextFragment;
    }());
})(Protocol = exports.Protocol || (exports.Protocol = {}));

},{"./monaco":7,"./rengascent.env":9}]},{},[10])(10)
});

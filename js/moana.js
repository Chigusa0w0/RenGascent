(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rgMoana = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./moana.ngamimic":2}]},{},[1])(1)
});

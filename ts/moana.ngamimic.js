export const previewData = function(env, doc) {
    env.__NOW = Math.floor(Date.now() / 1000);
    env.__PROTOCOL = location.protocol;

    if (env.__PROTOCOL === "file:") {
        env.__PROTOCOL = "https:";
    }

    // nga logic
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
        init: function(gbit, adck, rvrc, act, ubit, llog) {
            this._n = {
                _bit: gbit,
                admincheck: adck,
                rvrc: rvrc,
                active: act,
                userBit: ubit
            }
            this.loginlog = llog
            for (let k in this._n) {
                this[k] = this._n[k] | 0
                if (!this[k])
                    this[k] = 0
            }
            for (let k in this._b)
                this[k] = this._b[k] & this._bit ? 1 : 0
            for (let k in this._ub)
                this[k] = this._ub[k] & this.userBit ? 1 : 0
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
        lib: env.__COMMONRES_PATH + "/js_commonLib.js?120870", // 通用库
        common: env.__COMMONRES_PATH + "/js_commonui.js?5872161", // 通用库
        forum: env.__COMMONRES_PATH + "/js_forum.js?3035942", // 论坛核心
        commonSpec: env.__IMG_STYLE + "/js_default.js?9908869", // 基础框架
        bbscode: env.__COMMONRES_PATH + "/js_bbscode_core.js?1308371", // BBCode 解释器
        bbscodeSpec: env.__IMG_STYLE + "/js_bbscode_smiles.js?2920965", // 表情列表与山口山相关
        md5: env.__COMMONRES_PATH + "/js_md5.js?140335", // 匿名用的哈希
        userItem: env.__COMMONRES_PATH + "/js_userItem.js?131056", // 用户道具
        highlighter: env.__COMMONRES_PATH + "/js_highlighter.js?140332", // Code 块代码高亮
        armory: env.__IMG_STYLE + "/js_armory.js?120685", // 山口山、山口丁、砍口垒成就
        read: env.__COMMONRES_PATH + "/js_read.js?3575361", // 帖子显示核心
        bbscodeMd: env.__COMMONRES_PATH + "/js_bbscode_md.js?120439", // Markdown 支持
        service: "/js_service.js?778546", // Service worker
        rand: 123456
    };

    (function() {
        var T = env.__SCRIPTS,
            eventName,
            header;
        T.lg = {}; // per-script loading count tracker
        T.loading = 0; // loading count tracker
        T.lo = {}; // load complete tracker
        T.cl = []; // callback storage
        T.load = function(script, callback, charset, mode) {
            // mode: 1 = in-place, 2 = in header
            var elem = (!(mode & 1) || !header) ? doc.createElement("script") : "";
            if (!header) {
                eventName = ("readyState" in elem) ? "onreadystatechange" : "onload";
                header = doc.getElementsByTagName("head")[0];
            }
            if (script.charAt(0) == "/" || script.substr(0, 4) == "http") {
                var k = "s_" + Math.random();
                this[k] = script;
                script = k;
            } else if (!this[script] || this.src(script)) {
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
                doc.write(`<script src="${this[script]}" type="text/javascript" ${eventName}="__SCRIPTS.ol(this,'${script}')" onerror="__SCRIPTS.oe(this,event)" ${charset ? `charset="${charset}"` : "charset=\"GBK\""
                    }></script>`);
            }
            else {
                elem.src = this[script];
                elem.type = "text/javascript";
                if (charset) {
                    elem.charset = charset;
                } else {
                    elem.charset = "GBK";
                }
                elem[eventName] = function() {
                    env.__SCRIPTS.ol(this, script);
                }
                elem.onerror = function(e) {
                    env.__SCRIPTS.oe(this, e);
                }
                header.insertBefore(elem, header.firstChild);
            }
        };
        T.src = function(s) {
            return false;
        };
        T.asyncLoad = function() {
            var a = arguments,
                x = a.length,
                mode;
            if (typeof a[x - 1] == "number") {
                mode = a[--x];
            }
            for (var i = 0; i < x; i++) {
                if (a[i]) {
                    this.load(a[i], typeof a[i + 1] == "function" ? a[++i] : 0, 0, mode);
                }
            }
        }
        // error log
        T.el = function(msg) {
            console.log(msg);
        };
        T.syncLoad = function() {
            var a = arguments;
            a[a.length] = (a[a.length] | 0) | 1;
            a.length++;
            T.asyncLoad.apply(this, a);
        };
        // on error
        T.oe = function(o, e) {
            this.el(o.src + " load error");
            if (this.loading > 0) {
                this.loading--;
            }
        };
        // on load
        T.ol = function(o, n) {
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
        T.wload = function(f) {
            if (this.loading < 1)
                return f();
            this.cl.push(f);
        }
    }
    )();

    env.__GP.init(0, 0, 0, 0, 0, "");

    env.__UFIMG = false;
    env.ngaAds = {
        ignore: function() { return true; },
        bbs_ads32_gen: function() {},
        bbs_ads8_load_new: function() {},
        bbs_ads8_load_new_load: function() {},
    };
};


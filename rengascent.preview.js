const previewRoutines = function(env, doc) {
    env.onerror = function(message, source, lineno, colno, error) {
        env.viewarea.renderbugfix = true;
        console.error(`Preview Frame Error:\n${message} ${source} ${lineno} ${colno}\n${error}`);
        return true;
    }

    env.cleanup = function() {
        var container = doc.getElementById("postcontentandsubject0");
        container.removeAttribute("class");

        var title = container.firstChild;
        if (title.tagName !== "h3") {
            var h3 = doc.createElement("h3");
            h3.id = "postsubject0";
            title.replaceWith(h3);
        }
    };

    env.setThreadTitle = function(data) {
        var title = doc.getElementById("title");
        title.innerHTML = "在帖子中的回复 NGA玩家社区";
    };

    env.setContent = function(data) {
        var container = doc.getElementById("postcontent0");
        container.innerHTML = data.post.content;
    };

    env.setUser = function(data) {
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

        userInfo[1] = {
            "uid": 0,
            "username": "某用户",
            "credit": 0,
            "medal": null,
            "reputation": "",
            "groupid": -1, // 依赖 __GROUPS
            "memberid": 0, // 依赖 __GROUPS
            "avatar": null,
            "yz": 4,
            "site": null,
            "honor": null,
            "regdate": 1600000000,
            "mute_time": 0,
            "postnum": 100,
            "rvrc": 10,
            "money": 10000,
            "thisvisit": 1600000000,
            "signature": null,
            "nickname": null,
            "bit_data": 34873856
        };

        userInfo.__REPUTATIONS[1] = {
            "0": "版面声望"
        };

        userInfo.__REPUTATIONS[1][1] = 0;

        env.commonui.userInfo.setAll(userInfo);
    };

    env.setDefault = function(data) {
        env.commonui.postArg.setDefault(
            1, 0, 1, 1, "36", "", "", "", ""
        );
    };

    env.setRender = function(data) {
        env.commonui.postArg.proc(
            0, env.$("postcontainer0"), env.$("postsubject0"), env.$("postcontent0"), env.$("postsign0"), env.$("posterinfo0"), env.$("postInfo0"),
            null, null, null, 1, 128, null, 1, 1600000000, "0,0,0", "21", "", "", "", null, null, 0
        );
    };

    env.rewriteLink = function() {
        var links = doc.getElementsByTagName("a");
        for (let i = links.length - 1; i >=0; i--) {
            var link = links[i];
            var href = link.getAttribute("href");

            if ((href == null) || (href == "")) {
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

    env.removeUnused = function() {
        var links = doc.getElementsByTagName("a");
        for (let i = links.length - 1; i >= 0; i--) {
            var link = links[i];
            if ((link.href === "javascript:void(0)") && ((link.title === "收藏") || (link.title === "操作菜单"))) {
                link.parentNode.removeChild(link);
            }
        }

        var poster = doc.querySelectorAll("#posterinfo0");
        for (let i = poster.length - 1; i >= 0; i--) {
            poster[i].style.display = "none";
        }

        var postInfo = doc.getElementById("postInfo0");
        postInfo.style.display = "none";

        var postContent = doc.getElementById("postcontentandsubject0");
        postContent.firstChild.style.display = "none";
    };

    env.resizeParentDebounce = null;
    env.resizeParent = function() {
        clearTimeout(env.resizeParentDebounce);
        env.resizeParentDebounce = setTimeout(function() {
            let height = env.viewarea.contentWindow.document.body.scrollHeight;
            let outHeight = height + env.viewarea.heightOffset;
            env.viewarea.height = outHeight;
        }, 100);
    };

    env.render = function(data) {
        env.cleanup();

        env.setThreadTitle(data);
        env.setContent(data);
        env.setUser(data);
        env.setDefault(data);
        env.setRender(data);

        env.rewriteLink();
        env.removeUnused();

        env.resizeParent();
    };

    env.vmStart = function(bbcode) {
        try {
            var data = {};
            data.post = {};
            data.post.content = bbcode
                .replace(/\&/g, '&amp;')
                .replace(/\"/g, '&quot;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
                .replace(/\$/g, '&#36').replace(/\'/g, '&#39;').replace(/\\/g, '&#92;')
                .replace(/\t/g,'&emsp;&emsp;').replace(/\n/g,'<br/>').replace(/\r/g,'');

            let scroll = env.pageYOffset || 0;

            if(doc.readyState === "ready" || doc.readyState === "complete") {
                env.render(data);
            }
            else {
                doc.onreadystatechange = function () {
                    if (doc.readyState === "ready" || doc.readyState === "complete") {
                        env.render(data);
                    }
                }
            }

            env.scrollTo(0, scroll);

            return false;
        }
        catch (e) {
            console.log(e);
            return true;
        }
    };
};

const previewData = function(env, doc) {
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
                doc.write('<script src="' + this[script] + '" type="text/javascript" ' + eventName + '="__SCRIPTS.ol(this,\'' + script + '\')" onerror="__SCRIPTS.oe(this,event)" ' + (charset ? 'charset="' + charset + '"' : '') + '></script>');
            }
            else {
                elem.src = this[script];
                elem.type = "text/javascript";
                if (charset) {
                    elem.charset = charset;
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

const previewFinalizer = function(env, doc) {
    // override copy check
    env.ubbcode.copyChk = function() {};

    // override buggy decryption
    env.ubbcode.decrypt = function(pass, txt, cC, argsId) {
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
    }

    // override menu
    env.commonui.postBtn.allBtn = function() {};
    env.commonui.postBtnLite = function() {};
    env.commonui.favor = function() {};
    env.commonui.postScoreAdd = function() {};

    // override scroll ban
    env.commonui.crossDomainCall.setCallBack('iframeReadNoScrollInit', function() {});
    env.commonui.crossDomainCall.setCallBack('iframeReadNoScroll', function() {});

    // respond to img/collapse/randomblock
    const resizeObserver = new ResizeObserver(entries => {
        env.resizeParent();
    });
    resizeObserver.observe(doc.body);
    env.resizeParent();
};

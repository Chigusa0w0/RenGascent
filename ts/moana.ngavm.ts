import { NgaData } from "./moana.ngadata"
import * as NgaMimic from "./moana.ngamimic";

declare global {
    interface Window {
        // parent authority
        needReload: () => void;
        viewarea: HTMLIFrameElement;
        viewareaHeightOffset: number;
        initContent: string | NgaData.IContentData;

        // vm owned routines
        vmStart: (data: string | NgaData.IContentData) => boolean;

        cleanup: () => void;
        rewriteLink: () => void;
        resizeParent: () => void;
        resizeParentDebounce: number;

        setThreadTitle: (data: NgaData.IContentData) => void;
        setPostTitle: (data: NgaData.IContentData) => void;
        setContent: (data: NgaData.IContentData) => void;
        setEnv: (data: NgaData.IContentData) => void;
        setUser: (data: NgaData.IContentData) => void;
        setDefault: (data: NgaData.IContentData) => void;
        setAlter: (data: NgaData.IContentData) => void;
        setRender: (data: NgaData.IContentData) => void;
        removeUnused: (data: NgaData.IContentData) => void;
        render: (data: NgaData.IContentData) => void;

        // referenced nga native variables
        __CURRENT_FID: number;
        __CURRENT_TID: number;
        __CURRENT_STID: number;
        __SELECTED_FORUM: number;
        __AVATAR_BASE_VIEW: string;
        __IMGPATH: string;
        __IMG_STYLE: string;

        // nga native lib
        commonui: any;
        ubbcode: any;
        $: any;
    }
}

export module NgaVM {

    export const previewRoutines = (env: Window, doc: Document) => {
        env.onerror = (message, source, lineno, colno, error) => {
            console.error(`Uncaught Preview Frame Error:\n${error}`);
            if (env.needReload)
                env.needReload();
            return true;
        }

        env.cleanup = () => {
            const container = doc.getElementById("postcontentandsubject0");
            if (container) {
                container.removeAttribute("class");
                const title = container.firstChild as HTMLElement;
                if (title && title.tagName !== "h3") {
                    const h3 = doc.createElement("h3");
                    h3.id = "postsubject0";
                    title.replaceWith(h3);
                }
            }
            
            const signature = doc.getElementById("postsign0");
            if (signature) {
                signature.innerHTML = "";
            }

            const userbar = doc.getElementsByClassName("posterInfoLine");
            let notFirst = false;
            for (let i = userbar.length - 1; i >= 0; i--) {
                const user = userbar[i];
                
                if (notFirst) {
                    user.parentNode?.removeChild(user);
                    continue;
                }
                else {
                    (user as HTMLElement).style.display = 'none';
                    user.innerHTML = "<a href='' id='postauthor0' class='author b'></a>";
                    notFirst = true;
                }
            }
        };

        env.setThreadTitle = data => {
            const title = doc.getElementById("title");
            if (!title) return;

            if (data.thread?.title) {
                title.innerHTML = `在 - ${data.thread.title} - 中的回复 NGA玩家社区`;
            }
            else {
                title.innerHTML = "在帖子中的回复 NGA玩家社区";
            }
        };

        env.setPostTitle = data => {
            const title = document.getElementById("postsubject0");
            if (!title) return;
            
            title.innerHTML = data.post?.title ?? "";
        }

        env.setContent = data => {
            var container = doc.getElementById("postcontent0");
            if (!container) return;

            container.innerHTML = data.post?.content ?? "";
        };

        env.setEnv = data => {
            if (data.thread) {
                env.__CURRENT_FID = data.thread.fid;
                env.__CURRENT_TID = data.thread.tid;
                env.__CURRENT_STID = data.thread.stid;
                env.__SELECTED_FORUM = data.thread.fid;
            }
            else if (data.post) {
                env.__CURRENT_FID = data.post.fid ?? 1;
                env.__CURRENT_TID = data.post.tid ?? 1;
                env.__CURRENT_STID = 0;
                env.__SELECTED_FORUM = data.post.fid ?? 1;
            }
        }

        env.setUser = function(data) {
            let userInfo: any = {
                "__GROUPS": {
                    "0": {
                        "0": "用户",
                        "1": 622816,
                        "2": 0
                    }
                },
                "__REPUTATIONS": {}
            };

            userInfo[data.post?.uid ?? 1] = {
                "uid": data.user?.uid ?? 0,
                "username": data.user?.uname ?? "某用户",
                "credit": 0,
                "medal": null,
                "reputation": "",
                "groupid": -1, // 依赖 __GROUPS
                "memberid": 0, // 依赖 __GROUPS
                "avatar": data.user?._avatarUrl ?? null,
                "yz": data.user?.activeLevel ?? 4,
                "site": data.user?.fieldName ?? null,
                "honor": null,
                "regdate": data.user?.time ?? 1600000000,
                "mute_time": data.user?.globalMuteTime ?? 0,
                "postnum": data.user?.postcnt ?? 100,
                "rvrc": data.user?.credit ?? 10,
                "money": data.user?.gold ?? 10000,
                "thisvisit": data.user?.lastSeenTime ?? 1600000000,
                "signature": data.user?.signature ?? null,
                "nickname": null,
                "bit_data": 34873856
            };

            userInfo.__REPUTATIONS[data.post?.fid ?? 1] = {
                "0": "版面声望"
            };

            userInfo.__REPUTATIONS[data.post?.fid ?? 1][data.post?.uid ?? 1] = 0;

            env.commonui.userInfo.setAll(userInfo);
        };

        env.setDefault = data => {
            env.commonui.postArg.setDefault(
                data.post?.fid ?? 1, // 版面 id
                0, // 合集 id
                data.post?.tid ?? 1,  // 帖子 id
                data.post?.uid ?? 1, // 作者 id
                "36", // 帖子设置
                "", // 禁言用户
                "", // 访问量
                "", // 版主
                "" // 投票信息
            );
        };

        env.setAlter = data => {
            env.commonui.loadAlertInfo(
                data.post?.alterinfo ?? "", // 改动字符串
                "alertc0" // 显示容器
            );
        }

        env.setRender = data => {
            env.commonui.postArg.proc(
                data.post?.floor ?? 0, // 楼层
                env.$("postcontainer0"), // 帖子容器
                env.$("postsubject0"), // 标题
                env.$("postcontent0"), // 内容
                env.$("postsign0"), // 签名
                env.$("posterinfo0"), // 用户信息
                env.$("postInfo0"), // 帖子信息
                null, // 操作按钮容器
                null, // 版面 id，设 null
                null, // 帖子 id，设 null
                data.post?.pid ?? 1, // 回复 id
                data.post?.attribute ?? 0, // 帖子类型
                null, // 帖子作者 id，设 null
                data.post?.uid ?? 1, // 回复作者 id
                data.post?.time ?? 1600000000, // 发帖时间
                "0,0,0", // 推荐值
                "21", // 内容长度
                "", // 作者 ip
                "", // 原版面名
                data.post?.client ?? "", // 发帖客户端
                null, // 合集 id，设null
                null, // 帖子道具
                0 // 额外选项
            );
        };

        env.rewriteLink = () => {
            const links = doc.getElementsByTagName("a");
            for (let i = links.length - 1; i >= 0; i--) {
                const link = links[i];
                const href = link.getAttribute("href");

                if ((href == null) || (href === "")) {
                    continue;
                }

                if ((!href.startsWith("about:")) && (!href.startsWith("javascript:")) && (!href.startsWith("#"))) {
                    link.target = "_blank";

                    if (href.startsWith("/")) {
                        link.href = `https://ngabbs.com${href}`;
                    }
                }
            }
        };

        env.removeUnused = (data) => {
            const links = doc.getElementsByTagName("a");
            for (let i = links.length - 1; i >= 0; i--) {
                const link = links[i];
                if ((link.href === "javascript:void(0)") && ((link.title === "收藏") || (link.title === "操作菜单"))) {
                    if (!link.parentNode) continue;
                    link.parentNode.removeChild(link);
                }
            }

            const poster = doc.querySelectorAll("#posterinfo0");
            for (let i = poster.length - 1; i >= 0; i--) {
                const posterInfo = poster[i].parentElement;
                if (!posterInfo) continue;

                posterInfo.style.display = (!data.user) ? "none" : "";
            }

            const postInfo = doc.getElementById("postInfo0");
            if (postInfo) {
                postInfo.style.display = (!data.post?.time) ? "none" : "";
            }

            const postContent = doc.getElementById("postcontentandsubject0");
            if (postContent?.firstChild) {
                (postContent.firstChild as HTMLElement).style.display = 
                    (!data.post?.upvote && !data.post?.downvote && !data.post?.title) ? "none" : "";
            }
        };

        env.resizeParentDebounce = 0;
        env.resizeParent = () => {
            clearTimeout(env.resizeParentDebounce);

            env.resizeParentDebounce = env.setTimeout(() => {
                if (!env.viewarea || !env.viewareaHeightOffset) return;

                let height = doc.body.scrollHeight;
                let outHeight = height + env.viewareaHeightOffset;
                env.viewarea.height = outHeight.toString();
            }, 100);
        };

        env.render = data => {
            env.cleanup();

            env.setThreadTitle(data);
            // env.setPostTitle(data);
            env.setContent(data);
            // env.setEnv(data);
            env.setUser(data);
            env.setDefault(data);
            // env.setAlter(data);
            env.setRender(data);
            env.removeUnused(data);

            env.rewriteLink();

            env.resizeParent();
        };

        env.vmStart = (data: string | NgaData.IContentData) => {
            try {
                let rendering: NgaData.IContentData;

                if (typeof(data) === "string") {
                    const tmp: any = {};
                    tmp.post = {};
                    tmp.post.content = data
                        .replace(/\&/g, "&amp;")
                        .replace(/\"/g, "&quot;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;")
                        .replace(/\$/g, "&#36").replace(/\'/g, "&#39;").replace(/\\/g, "&#92;")
                        .replace(/\t/g, "&emsp;&emsp;").replace(/\n/g, "<br/>").replace(/\r/g, "");

                    rendering = tmp as NgaData.IContentData;
                } else {
                    rendering = data;
                }

                const scroll = env.scrollY || 0;

                if(doc.readyState === "complete") {
                    env.render(rendering);
                }
                else {
                    doc.onreadystatechange = () => {
                        if (doc.readyState === "complete") {
                            env.render(rendering);
                        }
                    }
                }

                env.scrollTo(0, scroll);

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

    export const previewData = (env: Window, doc: Document) => {
        NgaMimic.previewData(env, doc);
    };

    export const previewInitializer = (env: Window, doc: Document) => {
        // force avatar & signature display
        env.commonui = Object.defineProperties(env.commonui ? env.commonui : {}, {
            "avatarUrl": {
                value: function(y: string, uid: string) {
                    const i = y.match(/^\.a\/(\d+)_(\d+)\.(jpg|png|gif)\?(\d+)/);
                    if (i) {
                        y = env.__AVATAR_BASE_VIEW +
                            "/" +
                            (`000000000${parseInt(i[1], 10).toString(16)}`).replace(
                                /.+?([0-9a-z]{3})([0-9a-z]{3})([0-9a-z]{3})$/, "$3/$2/$1") +
                            `/${i[1]}_${i[2]}.${i[3]}?${i[4]}`;
                    }
                    else if (y.match(/^https?:\/\/([^\/]+)\//)) {
                        //if (!y.match(_ALL_IMG_HOST_REG) && uid != window.__CURRENT_UID)
                        //    y = ""
                        //some of the old attach servers can not be detected
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
            // feature是cLength的计算方法导致的
            // js_read.js Line 379: a.cLength = this.postDispCalcContentLength(a.contentC);
            "postDispCalcContentLength": {
                value() {
                    return 21;
                },
                writable: false
            }
        });

        env.commonui.posterInfo = Object.defineProperties(env.commonui.posterInfo ? env.commonui.posterInfo : {}, {
            "avatar": {
                value: function(i: any, lite: number | string, avatar: any, buff: any, at: any, uid: any) {
                    if (typeof(lite) === "string") {
                        lite = parseInt(lite, 10);
                    }

                    if (lite === 0) {
                        lite = 2;
                    }

                    avatar = this.c.selectUserPortrait(avatar, buff, uid);
            
                    if (!avatar) {
                        if (lite & 8) {
                            return `<div class='avatar avatar_none ${(lite & 1) ? "avatar_small" : ""}'></div>`;
                        }
                        return "";
                    }
            
                    if (lite & 1) {
                        return `<img src="${avatar.replace(/http:\/\/pic1\.178\.com\/avatars\/(\d+)\/(\d+)\/(\d+)\/(\d+)_(\d+)\.jpg/ig, "http://pic1.178.com/avatars/$1/$2/$3/25_$5.jpg")}" id="posteravatar${i}" class="avatar avatar_small${avatar.noborder ? " avatar_noborder" : ""}"/>${(at && at.sp && at.sp[3]) ? ` <img src='${env.__IMG_STYLE}/${at.sp[3]}' style='vertical-align:bottom'/>` : ""}`;
                    }
                    else if (lite & 2) {
                        if (avatar.func) {
                            return `<img src="${avatar}" id="posteravatar${i}" class="avatar${avatar.noborder ? " avatar_noborder" : ""
                                }" style="display:none;max-width:180px;max-height:255px" onload="commonui.posterInfo['${avatar.func}'](this)"/>`;
                        }
                        return `<img src="${avatar}" id="posteravatar${i}" style="max-width:180px;max-height:255px" class="avatar${avatar.noborder ? " avatar_noborder" : ""}"/>${(at && at.sp && at.sp[3]) ? `<img src='${env.__IMG_STYLE}/${at.sp[3]
                            }' style='display:none' onload='this.style.marginLeft=this.style.marginRight="-"+this.width/2+"px";this.style.display=""'/>` : ""}`;
                    }

                    return "";
                },
                writable: false
            }
        });
    }

    export const previewFinalizer = (env: Window, doc: Document) => {
        // override copy check
        env.ubbcode.copyChk = () => {};

        // override buggy decryption
        env.ubbcode.decrypt = (pass: string, txt: string, cC: HTMLElement, argsId: string) => {
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
        env.commonui.postBtn.allBtn = () => {};
        env.commonui.postBtnLite = () => {};
        env.commonui.favor = () => {};
        env.commonui.postScoreAdd = () => {};

        // override scroll ban
        env.commonui.crossDomainCall.setCallBack("iframeReadNoScrollInit", () => {});
        env.commonui.crossDomainCall.setCallBack("iframeReadNoScroll", () => {});

        // respond to img/collapse/randomblock
        const resizeObserver = new ResizeObserver(entries => {
            env.resizeParent();
        });
        resizeObserver.observe(doc.body);
        env.resizeParent();
    };
}
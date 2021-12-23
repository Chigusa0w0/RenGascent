import { monaco } from "./monaco.editor"
import { Environment } from "./rengascent.env";

export module BBSemantic {

    class BBCodeLink implements monaco.languages.ILink {
        range: monaco.IRange;
        url: string;

        constructor(range: monaco.IRange, url: string) {
            this.range = range;
            this.url = url;
        }
    }

    const bbcodeConfOverride: monaco.editor.IStandaloneEditorConstructionOptions = {
        autoClosingBrackets: "always",
        autoIndent: "keep",
        autoSurround: "brackets",
        copyWithSyntaxHighlighting: false,
        detectIndentation: false,
        insertSpaces: true,
        renderWhitespace: "all"
    };

    const bbcodeTokenizer: monaco.languages.IMonarchLanguage = {
        defaultToken: "",
        tokenPostfix: ".bbcode",

        tokenizer: {
            root: [
                // code override
                [/(\[)(code)/, [{ token: "delimiter" }, { token: "tag", next: "@code" }]],
                
                // content override
                [/(\[)(crypt)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter", next: "@crypt" }]],
                [/(\[)(img|album|iframe)(=?)([^\]]*)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "abstract" }, { token: "delimiter", next: "@image" }]],
                [/(\[)(url|flash|tid|pid|dice|urlreplace)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter", next: "@image" }]],
                
                // tag override
                [/(\[)(markdown)(\])/, [{ token: "delimiter" }, { token: "bug" }, { token: "delimiter" }]],
                [/(\[)(comment\b)(.*?)(\])/, [{ token: "delimiter" }, { token: "comment" }, { token: "comment" }, { token: "delimiter" }]],
                [/(\[)(color)(=)(\w+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "$5" }, { token: "delimiter" }]],
                [/(\[)(url)(=)([^\]]+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "reference" }, { token: "delimiter" }]],
                [/(\[)(collapse)(=)([^\]]+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators" }, { token: "abstract" }, { token: "delimiter" }]],
                [/(\[)(@)([^\]]+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "abstract" }, { token: "delimiter" }]],
                
                // strange tag
                [/(\[)(fixsize|style)/, [{ token: "delimiter" }, { token: "tag", next: "@style" }]],
                [/(-|=){3,}/, { token: "tag" }],
                [/(\[)(\*)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter" }]],
                
                // normal tag
                [/(\[)(\w+)(=)/, [{ token: "delimiter" }, { token: "tag" }, { token: "operators", next: "@value"}]],
                [/(\[)(\w+)(?=[\]\s])/, [{ token: "delimiter" }, { token: "tag", next: "@param"}]],
                
                // tag closing
                [/(\[\/)(\w+)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter" }]],
                
                // escape sequence
                [/<br\s*\/?>/, { token: "metatag" }],
                [/&(#\d+|nbsp|lt|gt|quot|amp);/, { token: "metatag" }],
                
                // body text (nothing special)
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
                [/(\[\/)(img|album|iframe|url|flash|tid|pid|dice|urlreplace)(\])/, [{ token: "delimiter" }, { token: "tag" }, { token: "delimiter", next: "@pop"}]],
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

    const bbcodeTheme: monaco.editor.IStandaloneThemeData = {
        base: "vs",
        inherit: true,
        colors: {
            'editor.background': Environment.getSiteTheme().themeColor,
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

            /* Bug: see https://github.com/microsoft/monaco-editor/issues/586
            { token: "bgskyblue.bbcode", foreground: "ffffff", background: "87ceeb", fontStyle: "bold" },
            { token: "bgroyalblue.bbcode", foreground: "ffffff", background: "4169e1", fontStyle: "bold" },
            { token: "bgblue.bbcode", foreground: "ffffff", background: "0000ff", fontStyle: "bold" },
            { token: "bgdarkblue.bbcode", foreground: "ffffff", background: "00008b", fontStyle: "bold" },
            { token: "bgorange.bbcode", foreground: "ffffff", background: "ffa500", fontStyle: "bold" },
            { token: "bgorangered.bbcode", foreground: "ffffff", background: "ff4500", fontStyle: "bold" },
            { token: "bgcrimson.bbcode", foreground: "ffffff", background: "dc143c", fontStyle: "bold" },
            { token: "bgred.bbcode", foreground: "ffffff", background: "ff0000", fontStyle: "bold" },
            { token: "bgfirebrick.bbcode", foreground: "ffffff", background: "b22222", fontStyle: "bold" },
            { token: "bgdarkred.bbcode", foreground: "ffffff", background: "8b0000", fontStyle: "bold" },
            { token: "bggreen.bbcode", foreground: "ffffff", background: "008000", fontStyle: "bold" },
            { token: "bglimegreen.bbcode", foreground: "ffffff", background: "32cd32", fontStyle: "bold" },
            { token: "bgseagreen.bbcode", foreground: "ffffff", background: "2e8b57", fontStyle: "bold" },
            { token: "bgteal.bbcode", foreground: "ffffff", background: "008080", fontStyle: "bold" },
            { token: "bgdeeppink.bbcode", foreground: "ffffff", background: "ff1493", fontStyle: "bold" },
            { token: "bgtomato.bbcode", foreground: "ffffff", background: "ff6347", fontStyle: "bold" },
            { token: "bgcoral.bbcode", foreground: "ffffff", background: "ff7f50", fontStyle: "bold" },
            { token: "bgpurple.bbcode", foreground: "ffffff", background: "800080", fontStyle: "bold" },
            { token: "bgindigo.bbcode", foreground: "ffffff", background: "4b0082", fontStyle: "bold" },
            { token: "bgburlywood.bbcode", foreground: "ffffff", background: "deb887", fontStyle: "bold" },
            { token: "bgsandybrown.bbcode", foreground: "ffffff", background: "f4a460", fontStyle: "bold" },
            { token: "bgchocolate.bbcode", foreground: "ffffff", background: "d2691e", fontStyle: "bold" },
            { token: "bgsienna.bbcode", foreground: "ffffff", background: "a0522d", fontStyle: "bold" },
            { token: "bgsilver.bbcode", foreground: "ffffff", background: "c0c0c0", fontStyle: "bold" },
            { token: "bggray.bbcode", foreground: "ffffff", background: "808080", fontStyle: "bold" },
            */
        ]
    };

    const bbcodeLang: monaco.languages.LanguageConfiguration = {
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

    const bbcodeLink: monaco.languages.LinkProvider = {
        provideLinks(model, token) {
            let links: monaco.languages.ILink[] = [];

            const count = model.getLineCount();
            const picRegex = /(?<!\w)\.\/mon_20\d{4}\/\d+\/[\w\-\.]+\.(png|jpg|jpeg|bmp|svg|gif)/g;
            const siteRegex = /(?<!\w)\/(thread|read|post|nuke)\.php\?([\w\-\&\=\%\#]+)/g;
            const atRegex = /\[@(.{2,20}?)\]/g;
            const idRegex = /\[(uid|pid|tid|stid|fid)[=\]](-?\d+)(.*?)\[\/\1\]/g;
            const urlRegex = /\bhttps?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

            const currentServer = location.protocol + "//" + location.host;
            for (let i = 1; i <= count; i++) {
                const text = model.getLineContent(i);
                let match: RegExpExecArray | null = null;
                while ((match = picRegex.exec(text)) !== null) {
                    let range = new monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    links.push(new BBCodeLink(range, match[0].replace("./mon_20", "https://img.nga.178.com/attachments/mon_20")));
                }

                while ((match = siteRegex.exec(text)) !== null) {
                    let range = new monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    links.push(new BBCodeLink(range, currentServer + match[0]));
                }

                while ((match = atRegex.exec(text)) !== null) {
                    let range = new monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    let uidAt = match[0].match(/^(?:UID)?(\d+)$/);
                    let selector = (uidAt !== null) ? `uid=${uidAt[1]}` : `username=${encodeURIComponent(match[0])}`;
                    links.push(new BBCodeLink(range, currentServer + "/nuke.php?func=ucp&__inchst=UTF-8&" + selector));
                }

                while ((match = idRegex.exec(text)) !== null) {
                    let range = new monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    let url = currentServer;
                    switch (match[1]) {
                        case "tid": url += `/read.php?tid=${match[2]}`; break;
                        case "pid": url += `/read.php?pid=${match[2]}&opt=128`; break;
                        case "uid": url += `/nuke.php?uid=${match[2]}&func=ucp`; break;
                        case "stid": url += `/thread.php?stid=${match[2]}`; break;
                        case "fid": url += `/thread.php?fid=${match[2]}`; break;
                    }
                    links.push(new BBCodeLink(range, url));
                }

                // original monaco link handler can't work well in a bracket tagging environment
                while ((match = urlRegex.exec(text)) !== null) {
                    let range = new monaco.Range(i, match.index + 1, i, match.index + match[0].length + 1);
                    links.push(new BBCodeLink(range, match[0]));
                }
            }

            return { links: links };
        },

        resolveLink(link, token) {
            if (link.url) {
                if (link.url instanceof monaco.Uri)
                {
                    link.url = link.url.toString();
                }
                const index = link.url.indexOf("[");
                if (index > 0) {
                    link.url = link.url.substring(0, index);
                }
            }
            return link;
        }
    };

    export function registerBbcode(): monaco.editor.IStandaloneEditorConstructionOptions {
        monaco.languages.register({ id: "bbcode" });
        monaco.languages.setMonarchTokensProvider("bbcode", bbcodeTokenizer);
        monaco.languages.setLanguageConfiguration("bbcode", bbcodeLang);
        monaco.languages.registerLinkProvider("bbcode", bbcodeLink);
        monaco.editor.defineTheme("bbcode", bbcodeTheme);

        return bbcodeConfOverride;
    }
}
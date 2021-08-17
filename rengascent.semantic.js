const posToRange = function(a, b, c, d) {
    return {
        startLineNumber: a,
        startColumn: b,
        endLineNumber: c,
        endColumn: d,
    };
};

const bbcodeTokenizer = {
    defaultToken: '',
    tokenPostfix: '.bbcode',

    tokenizer: {
        root: [
            // code override
            [/(\[)(code)/.source, ['delimiter', { token: 'tag', next: '@code' }]],

            // content override
            [/(\[)(crypt)(\])/.source, ['delimiter', 'tag', { token: 'delimiter', next: '@crypt' }]],
            [/(\[)(img|album|iframe)(=?)([^\]]*)(\])/.source, ['delimiter', 'tag', 'operators', 'abstract', { token: 'delimiter', next: '@image' }]],
            [/(\[)(url|flash|tid|pid|dice|urlreplace)(\])/.source, ['delimiter', 'tag', { token: 'delimiter', next: '@image' }]],

            // tag override
            [/(\[)(markdown)(\])/.source, ['delimiter', 'bug', 'delimiter']],
            [/(\[)(comment\b)(.*?)(\])/.source, ['delimiter', 'comment', 'comment', 'delimiter']],
            [/(\[)(color)(=)(\w+)(\])/.source, ['delimiter', 'tag', 'operators', { token: '$4' }, 'delimiter']],
            [/(\[)(url)(=)([^\]]+)(\])/.source, ['delimiter', 'tag', 'operators', 'reference', 'delimiter']],
            [/(\[)(collapse)(=)([^\]]+)(\])/.source, ['delimiter', 'tag', 'operators', 'abstract', 'delimiter']],
            [/(\[)(@)([^\]]+)(\])/.source, ['delimiter', 'tag', 'abstract', 'delimiter']],

            // strange tag
            [/(\[)(fixsize|style)/.source, ['delimiter', { token: 'tag', next: '@style' }]],
            [/(---|===)/.source, 'tag'],
            [/(\[)(\*)(\])/.source, ['delimiter', 'tag', 'delimiter']],

            // normal tag
            [/(\[)(\w+)(=)/.source, ['delimiter', 'tag', { token: 'operators', next: '@value'}]],
            [/(\[)(\w+)(?=[\]\s])/.source, ['delimiter', { token: 'tag', next: '@param'}]],

            // tag closing
            [/(\[\/)(\w+)(\])/.source, ['delimiter', 'tag', 'delimiter']],

            // escape sequence
            [/<br\s*\/?>/.source, 'metatag'],
            [/&(#\d+|nbsp|lt|gt|quot|amp);/.source, 'metatag'],

            // body text (nothing special)
        ],

        code: [
            [/=/.source, 'operators', '@codeTyped'],
            [/\]/.source, { token: 'delimiter', next: '@crypt' }],
            [/(\[\/)(code)(\])/.source, ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }]]
        ],

        codeTyped: [
            [/(\w+)(\])/.source, ['attribute.value', { token: 'delimiter', next: '@codeEmbedded', nextEmbedded: '$1' }]],
            [/\[\/code\]/.source, { token: '@rematch', next: '@pop' }]
        ],

        codeEmbedded: [
            [/\[\/code/.source, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
            [/[^\[\<]+/.source, '']
        ],

        crypt: [
            [/<br\s*\/?>/.source, 'bug'],
            [/(\[\/)(crypt|code)(\])/.source, { token: '@rematch', next: '@pop' }],
            [/[^\[\<]+/.source, 'comment'],
            [/[\[\<]/.source, 'comment'],
        ],

        image: [
            [/[^\[\]]+/.source, 'reference'],
            [/(\[\/)(img|album|iframe|url|flash|tid|pid|dice|urlreplace)(\])/.source, ['delimiter', 'tag', { token: 'delimiter', next: '@pop'}]],
        ],

        style: [
            [/(height|width|background|rotate|scale|margin|padding|clear|float|top|bottom|left|right|align|width|height|border-radius|line-height|font|src|background|color|dybg|innerHTML)/.source, 'attribute.name'],
            [/parentfitwidth/.source, 'bug'],
            [/[^\s\]]+/.source, 'attribute.value'],
            [/\]/.source, 'delimiter', '@pop'],
        ],

        value: [
            [/[^\]]+/.source, 'attribute.value'],
            [/\]/.source, 'delimiter', '@pop'],
        ],

        param: [
            [/(\w+)(=)/.source, ['attribute.name', 'operators']],
            [/[^\s\]]+/.source, 'attribute.value'],
            [/\]/.source, 'delimiter', '@pop'],
        ],
    },
};

const bbcodeTheme = {
    base: "vs",
    inherit: true,
    colors: {
        'editor.background': unsafeWindow.__COLOR.bg0,
    },
    rules: [
        { background: unsafeWindow.__COLOR.bg0 },
        { token: "abstract.bbcode", foreground: "a31515" },
        { token: "attribute.name.bbcode", foreground: "6f42c1" },
        { token: "attribute.value.bbcode", foreground: "005cc5" },
        { token: "comment.bbcode", foreground: "008000" },
        { token: "delimiter.bbcode", foreground: "d93a49" },
        { token: "metatag.bbcode", foreground: "005cc5" },
        { token: "operators.bbcode", foreground: "6f42c1" },
        { token: "reference.bbcode", foreground: "6a737d" },
        { token: "tag.bbcode", foreground: "d93a49" },
        { token: "pragma.bbcode", foreground: "3d9970", fontStyle: "bold" },
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
        { token: "seagreen.bbcode", foreground: "2e8c57", fontStyle: "bold" },
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
    ]
};

const bbcodeLang = {
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '<', close: '>' },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
    ],
};

const bbcodeLink = {
    provideLinks: function (model, token) {
        let links = [];

        const count = model.getLineCount();
        const picRegex = /(?<!\w)\.\/mon_20\d{4}\/\d+\/[\w\-\.]+\.(png|jpg|jpeg|bmp|svg|gif)/g;
        const siteRegex = /(?<!\w)\/(thread|read|post|nuke)\.php\?([\w\-\&\=\%\#]+)/g;
        const atRegex = /\[@(.{2,20}?)\]/g;
        const idRegex = /\[(uid|pid|tid|stid|fid)[=\]](-?\d+)(.*?)\[\/\1\]/g;
        const urlRegex = /\bhttps?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

        const currentServer = location.protocol + '//' + location.host;
        for (let i = 1; i <= count; i++) {
            const text = model.getLineContent(i);
            let match = null;
            while ((match = picRegex.exec(text)) !== null) {
                let range = posToRange(i, match.index + 1, i, match.index + match[0].length + 1);
                links.push({ range: range, url: match[0].replace('./mon_20', 'https://img.nga.178.com/attachments/mon_20') });
            }

            while ((match = siteRegex.exec(text)) !== null) {
                let range = posToRange(i, match.index + 1, i, match.index + match[0].length + 1);
                links.push({ range: range, url: currentServer + match[0] });
            }

            while ((match = atRegex.exec(text)) !== null) {
                let range = posToRange(i, match.index + 1, i, match.index + match[0].length + 1);
                let uidAt = match[0].match(/^(?:UID)?(\d+)$/);
                let selector = (uidAt !== null) ? `uid=${uidAt[1]}` : `username=${encodeURIComponent(match[0])}`;
                links.push({ range: range, url: currentServer + '/nuke.php?func=ucp&__inchst=UTF-8&' + selector });
            }

            while ((match = idRegex.exec(text)) !== null) {
                let range = posToRange(i, match.index + 1, i, match.index + match[0].length + 1);
                let url = currentServer;
                switch (match[1]) {
                    case 'tid': url += `/read.php?tid=${match[2]}`; break;
                    case 'pid': url += `/read.php?pid=${match[2]}&opt=128`; break;
                    case 'uid': url += `/nuke.php?uid=${match[2]}&func=ucp`; break;
                    case 'stid': url += `/thread.php?stid=${match[2]}`; break;
                    case 'fid': url += `/thread.php?fid=${match[2]}`; break;
                }
                links.push({ range: range, url: url });
            }

            // original monaco link handler can't work well in a bracket tagging environment
            while ((match = urlRegex.exec(text)) !== null) {
                let range = posToRange(i, match.index + 1, i, match.index + match[0].length + 1);
                links.push({ range: range, url: match[0] });
            }
        }

        return { links: links };
    },

    resolveLink: function (link, token) {
        if (link.url) {
            let index = link.url.indexOf('[');
            if (index > 0) {
                link.url = link.url.substring(0, index);
            }
        }
        return link;
    }
};

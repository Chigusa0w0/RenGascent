namespace BBCode {

    export class SyntaxChecker {
        source: string;
        findings: Notice[];

        constructor(text: string) {
            this.source = text;
            this.findings = [];
        }

        tokenPass(this: SyntaxChecker): Tag[] {
            let tags: Tag[];

            tags = [];

            while (true) {
                const match = Def.tagRegex.exec(this.source);
                if (!match) break;

                let tagName = match[2];
                let isClosing = match[1] === "/";
                let param = match[3];
                let index = match.index;
                let length = match[0].length;

                if (Def.recognizedTags.indexOf(tagName) >= 0) {
                    const tag = this.commonParser(tagName, isClosing, param, index, length);
                    tags.push(tag);
                }
                else {
                    if (Def.recognizedSpecial.indexOf(tagName) < 0) {
                        this.issueUnrecognizedTag(tagName, isClosing, param, index, length);
                    }
                }
            }

            for (let i = 0; i < Def.recognizedRegex.length; i++) {
                while (true) {
                    const rule = Def.recognizedRegex[i];
                    const match = rule.regex.exec(this.source);
                    if (!match) break;

                    let tagName = rule.name;
                    let index = match.index;
                    let length = match[0].length;

                    const tag = this.specialParser(tagName, match[0], index, length);
                    tags.push(tag);
                }
            }

            tags.sort((a, b) => a.startAt.isBefore(b.startAt) ? -1 : 1);

            return tags;
        }

        scopePass(this: SyntaxChecker, tags: Tag[]): Tag[] {
            let scopes: Tag[];
            let dimensions: Tag[][];
            let dimCurrent = 0;

            scopes = [];
            dimensions = [];
            dimensions[dimCurrent] = [];

            for (let i = 0; i < tags.length; i++) {
                let tag = tags[i];
                let isFunctional = Def.functionTags.indexOf(tag.name) >= 0;
                let isClosing = tag.closeAt === TagClosingDesc.Closing;
                let isAtom = tag.closeAt === TagClosingDesc.Atom;

                if (isAtom) {
                    scopes.push(tag);
                    continue;
                }

                if(isFunctional && !isClosing) {
                    dimCurrent++;
                    dimensions[dimCurrent] = [];
                }

                let currentDim = dimensions[dimCurrent];

                let found = false;
                if (isClosing) {
                    for (let j = currentDim.length - 1; j >= 0; j--) {
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
                    for (let j = 0; j < currentDim.length; j++) {
                        if (currentDim[j].closeAt !== TagClosingDesc.Opening) continue;
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

            for (let i = dimCurrent; i >= 0; i--) {
                for(let j = 0; j < dimensions[i].length; j++) {
                    if (dimensions[i][j].closeAt !== TagClosingDesc.Opening) continue;
                    this.issueMismatchedPairing(dimensions[i][j]);
                }
            }

            scopes.sort((a, b) => a.startAt.isBefore(b.startAt) ? -1 : 1);

            return scopes;
        }

        treePass(this: SyntaxChecker, tags: Tag[]): Tag[] {
            let root = Tag.createRootTag(this.source);

            for (let i = 0; i < tags.length; i++) {
                root.placeChild(tags[i]);
            }

            for (let i = 0; i < tags.length; i++) {
                let tag = tags[i];

                if (tag.parent === null || tag.parent === Tag.rootSign) {
                    Util.bug();
                }

                let parentRange = tag.parent.getInnerRange();
                let currentRange = tag.getOuterRange();
                if (!parentRange.isIncluding(currentRange)) {
                    this.issueInterlacingPairing(tag);
                }
            }

            tags.unshift(root);

            return tags;
        }

        argsPass(this: SyntaxChecker, tags: Tag[]): Tag[] {
            let checker = new ConstraintChecker(this.source);

            for (let i = 0; i < tags.length; i++) {
                let tag = tags[i];

                this.findings.push(...checker.handle(tag));
            }

            return tags;
        }

        commonParser(this: SyntaxChecker, tagName: string, isClosing: boolean, param: string, index: int, length: int): Tag {
            const pos = new TextRange(index, length);
            const argIdxOffset = 1 + (isClosing ? 1 : 0) + tagName.length;
            const argPos = new TextRange(index + argIdxOffset, param.length);
            let status = isClosing ? TagClosingDesc.Closing : TagClosingDesc.Opening;
            if (Def.atomTags.indexOf(tagName) >= 0) {
                status = TagClosingDesc.Atom;
            }
            const result = new Tag(tagName, param, argPos, pos, status);
            return result;
        }

        specialParser(this: SyntaxChecker, tag: string, text: string, index: int, length: int): Tag {
            const pos = new TextRange(index, length);
            const result = new Tag(tag, text, pos, pos, TagClosingDesc.Atom);
            return result;
        }

        issueUnrecognizedTag(this: SyntaxChecker, tagName: string, isClosing: boolean, param: string, index: int, length: int): void {
            const pos = new TextRange(index, length);
            let msg = Translation.tagUnrecognized(tagName);
            let notice = new Notice(NoticeLevel.Warning, pos, msg);
            this.findings.push(notice);
        }

        issueMismatchedPairing(this: SyntaxChecker, tag: Tag): void {
            let msg = Translation.pairingMismatched(tag.name);
            let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            this.findings.push(notice);
        }

        issueInterlacingPairing(this: SyntaxChecker, tag: Tag): void {
            if (!Util.isTextRange(tag.closeAt)) {
                Util.bug();
            }

            let msg = Translation.pairingInterlacing(tag.name);
            let notice = new Notice(NoticeLevel.Warning, tag.closeAt, msg);
            this.findings.push(notice);
        }
    }

    type int = number;
    type styleArgumentDesc = { [key: string]: { [key: string]: RegExp[] }};

    export class Tag {
        startAt: TextRange;
        closeAt: TextRange | TagClosingDesc;
        name: string; // no name means text node
        arguments: string;
        argumentRange: TextRange;
        parent: Tag | "__ROOT__" | null;
        children: Tag[];

        static readonly rootSign = "__ROOT__";

        static createRootTag(text: string): Tag {
            let rootRange = new TextRange(0, text.length);

            let root = new Tag("__ROOT__", "", new TextRange(0, 0), rootRange, TagClosingDesc.Atom);

            root.parent = "__ROOT__";

            return root;
        }

        constructor(name: string, arg: string, argRange: TextRange, startAt: TextRange, closeAt?: TextRange | TagClosingDesc) {
            this.name = name;
            this.arguments = arg;
            this.argumentRange = argRange;
            this.startAt = startAt;
            this.closeAt = closeAt || TagClosingDesc.Opening;
            this.parent = null;
            this.children = [];
        }

        getInnerRange(this: Tag): TextRange {
            if (Util.isTextRange(this.closeAt)) {
                let start = this.startAt.end();
                let end = this.closeAt.index;
                let length = end - start;
                return new TextRange(start, length);
            }
            else if (this.closeAt === TagClosingDesc.Atom) {
                return this.startAt;
            }
            else {
                Util.bug();
            }
        }

        getOuterRange(this: Tag): TextRange {
            if (Util.isTextRange(this.closeAt)) {
                let start = this.startAt.index;
                let end = this.closeAt.end();
                let length = end - start;
                return new TextRange(start, length);
            }
            else if (this.closeAt === TagClosingDesc.Atom) {
                return this.startAt;
            }
            else {
                Util.bug();
            }
        }

        placeChild(this: Tag, tag: Tag): boolean {
            if (!this.getInnerRange().isIncluding(tag.startAt)) {
                return false;
            }

            for(let i = 0; i < this.children.length; i++) {
                if (this.children[i].placeChild(tag)) {
                    return true;
                }
            }

            tag.parent = this;
            this.children.push(tag);
            this.children.sort((a, b) => a.startAt.isBefore(b.startAt) ? -1 : 1);

            return true;
        }
    }

    export enum TagClosingDesc {
        Opening,
        Closing,
        Atom
    }

    export class TextRange {
        index: int;
        length: int;

        constructor(index: int, length: int) {
            this.index = index;
            this.length = length;
        }

        end(this: TextRange): int {
            return (this.index + this.length);
        }

        getText(this: TextRange, text: string): string {
            return text.substring(this.index, this.end());
        }

        isBefore(this: TextRange, rhs: TextRange): boolean {
            return this.index < rhs.index;
        }

        isStrictBefore(this: TextRange, rhs: TextRange): boolean {
            return (this.end()) < rhs.index;
        }

        isIncluding(this: TextRange, rhs: TextRange): boolean {
            return (this.index <= rhs.index)
                && ((this.end()) >= (rhs.end()));
        }

        isEqual(this: TextRange, rhs: TextRange): boolean {
            return (this.index === rhs.index)
                && (this.length === rhs.length);
        }

        popFront(this: TextRange, length: int): TextRange {
            return new TextRange(this.index + length, this.length - length);
        }

        takeFront(this: TextRange, length: int): TextRange {
            return new TextRange(this.index, Math.min(this.length, length));
        }

        lookBack(this: TextRange, length: int): TextRange {
            return new TextRange(Math.max(this.index - length, 0), length);
        }
    }

    export class Notice {
        level: NoticeLevel;
        message: string | null;
        range: TextRange;

        constructor(level: NoticeLevel, range: TextRange, message?: string | null) {
            this.level = level;
            this.range = range;
            this.message = message || null;
        }
    }

    export enum NoticeLevel {
        Success = 0,
        Message = 1,
        Warning = 2,
        Error = 3
    }

    class ConstraintChecker {
        handlers: { [key: string]: (tag: Tag) => Notice[] };
        source: string;

        constructor(source: string) {
            this.source = source;

            this.handlers = {
                // style
                // "align": null,
                // "b": null,
                "color": (t) => this.handleColor(t),
                // "del": null,
                "font": (t) => this.handleFont(t),
                // "h": null,
                "hltxt": (t) => this.handleHltxt(t),
                "i": (t) => this.handleUniversalInnerLength(t, 52, true),
                // "l": null,
                // "r": null,
                "size": (t) => this.handleSize(t),
                "sub": (t) => this.handleUniversalInnerLength(t, 52, true),
                "sup": (t) => this.handleUniversalInnerLength(t, 52, true),
                // "u": null,
                "upup": (t) => this.handleUniversalInnerLength(t, 7, false),
                // "url": null,

                // function
                "album": (t) => this.handleUniversalAbstractText(t),
                // "attach": null,
                "chartradar": (t) => this.handleChartradar(t),
                // "code": null,
                "collapse": (t) => this.handleUniversalAbstractText(t),
                "crypt": (t) => this.handleCrypt(t),
                // "customachieve": null,
                // "dice": null,
                // "flash": null,
                "headline": (t) => this.handleHeadline(t),
                // "iframe": null,
                // "img": null,
                // "list": null,
                "omit": (t) => this.handleOmit(t),
                // "pid": null,
                // "quote": null,
                // "randomblock": null,
                // "span": null,
                // "stid": null,
                "style": (t) => this.handleStyle(t),
                // "table": null,
                // "td": null,
                // "tid": null,
                // "tr": null,
                // "uid": null,
                "urlreplace": (t) => this.handleUniversalNotRecommended(t),

                // atom
                // "*": null,
                "cnarmory": (t) => this.handleUniversalArgumentFormat(t, / [^\s]+ [^\s]+/, "[cnarmory 服务器 角色名]"),
                "euarmory": (t) => this.handleUniversalDeprecated(t),
                "fixsize": (t) => this.handleFixsize(t),
                "markdown": (t) => this.handleMarkdown(t),
                "stripbr": (t) => this.handleStripBr(t),
                "symbol": (t) => this.handleSymbol(t),
                "twarmory": (t) => this.handleUniversalDeprecated(t),
                "usarmory": (t) => this.handleUniversalDeprecated(t),

                // special
                // "at": null,
                "comment": (t) => this.handleUniversalRequireFixsize(t),
                // "heading": null,
                "lessernuke": (t) => this.handleLesserNuke(t),
                // "smile": null,
                "t.178.com": (t) => this.handleUniversalDeprecated(t),

                // unit
                "br": (t) => this.handleBr(t),
                "htmlentity": (t) => this.handleHtmlEntity(t),
            };
        }

        handle(this: ConstraintChecker, tag: Tag): Notice[] {
            let handler = this.handlers[tag.name];

            if (handler) {
                return handler(tag);
            }
            
            return [];
        }

        // --- style ---

        handleColor(this: ConstraintChecker, tag: Tag): Notice[] {
            let arg = tag.arguments;
            let match = arg.match(/^=(bg|)(\w+)$/);
            if (!match) {
                let msg = Translation.argumentMalformed(tag.name, "[color=颜色名]");
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            let name = match[2];
            if (Def.colorList.indexOf(name) < 0) {
                let msg = Translation.constraintColorOptionRange(name);
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        handleFont(this: ConstraintChecker, tag: Tag): Notice[] {
            let arg = tag.arguments;
            let match = arg.match(/^=([\w ]+)$/);
            if (!match) {
                let msg = Translation.argumentMalformed(tag.name, "[font=字体名]");
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            let name = match[1];
            if (Def.fontList.indexOf(name) < 0) {
                let msg = Translation.constraintFontOptionRange(name);
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        handleHltxt(this: ConstraintChecker, tag: Tag): Notice[] {
            if (tag.getInnerRange().getText(this.source).length > 0) {
                return [];
            }

            let msg = Translation.bugHeadlineMissingText();
            let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        }

        handleSize(this: ConstraintChecker, tag: Tag): Notice[] {
            let arg = tag.arguments;
            let match = arg.match(/^=(\d+)%$/);
            if (!match) {
                let msg = Translation.argumentMalformed(tag.name, "[size=缩放比例%]");
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            let size = parseInt(match[1], 10);
            if (size <= 0 || size >= 1000) {
                let msg = Translation.constraintSizeOptionRange(size);
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return []
        }

        // --- function ---

        handleChartradar(this: ConstraintChecker, tag: Tag): Notice[] {
            // TODO: detection
            let msg = Translation.bugChartradarFormat();
            let notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            let msg2 = Translation.bugNotRecommended(tag.name);
            let notice2 = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice, notice2];
        }

        handleCrypt(this: ConstraintChecker, tag: Tag): Notice[] {
            let msg = Translation.bugCryptNotWorking();
            let notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        }

        handleHeadline(this: ConstraintChecker, tag: Tag): Notice[] {
            let children = tag.children;

            for (let i = 0; i < children.length; i++) {
                if (children[i].name === "hltxt") {
                    return [];
                }
            }

            let msg = Translation.bugHeadlineMissingText();
            let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        }

        handleOmit(this: ConstraintChecker, tag: Tag): Notice[] {
            let notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }

            let inner = tag.getInnerRange().getText(this.source);
            if (inner.indexOf("[") >= 0 || inner.indexOf("]") >= 0 || inner.indexOf("<br") >= 0) {
                let msg = Translation.bugTagInOmit();
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        handleStyle(this: ConstraintChecker, tag: Tag): Notice[] {
            let notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }

            let result = this.parseStyleArguments(tag, Def.styleArgument);
            
            return result.notices;
        }

        // --- atom ---

        handleFixsize(this: ConstraintChecker, tag: Tag): Notice[] {
            if (tag.parent === null || tag.parent === Tag.rootSign) {
                let msg = Translation.constraintFixsizeContainer();
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            if (tag.parent.name !== "collapse" && tag.parent.name !== "randomblock") {
                let msg = Translation.constraintFixsizeContainer();
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            let result = this.parseStyleArguments(tag, Def.fixsizeArgument);
            for (let i = 0; i < result.routes.length; i++) {
                if (result.routes[i].ruleName === "t1") {
                    let msg = Translation.bugFixsizeBg();
                    let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                    result.notices.push(notice);
                }
            }

            return result.notices;
        }

        handleMarkdown(this: ConstraintChecker, tag: Tag): Notice[] {
            let msg = Translation.bugMarkdown();
            let notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        }

        handleStripBr(this: ConstraintChecker, tag: Tag): Notice[] {
            let notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }

            return this.handleUniversalParamenterless(tag);
        }

        handleSymbol(this: ConstraintChecker, tag: Tag): Notice[] {
            let notice = this.handleUniversalRequireFixsize(tag);
            if (notice.length > 0) {
                return notice;
            }

            let match = tag.arguments.match(/ (\w+)/);
            if (!match) {
                let msg = Translation.argumentMalformed(tag.name, "[symbol 符号名]");
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            let name = match[1];
            if (Def.symbolList.indexOf(name) < 0) {
                let msg = Translation.constraintSymbolOutOfRange(name);
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        // --- special ---

        handleLesserNuke(this: ConstraintChecker, tag: Tag): Notice[] {
            let msg = Translation.bugLesserNuke();
            let notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        }

        // --- unit ---

        handleBr(this: ConstraintChecker, tag: Tag): Notice[] {
            let parent = tag.parent;

            while (parent !== Tag.rootSign) {
                if (parent === null) Util.bug();

                if (parent.name === "code") {
                    let msg = Translation.bugBrInCode();
                    let notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
                    return [notice];
                }

                parent = parent.parent;
            }

            return [];
        }

        handleHtmlEntity(this: ConstraintChecker, tag: Tag): Notice[] {
            let entity = tag.arguments;
            let match = entity.match(/\d+/);
            if (match === null) Util.bug();

            let code = parseInt(match[0], 10);
            if (code > 0x7F && code < 0x4E00 || code > 0x9FA5 && code < 0x110000) {
                return [];
            }

            if (Def.entityExempt.indexOf(code) >= 0) {
                return [];
            }

            let msg = Translation.constraintEntityCodeRange(entity);
            let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        }

        // --- common ---

        handleUniversalAbstractText(this: ConstraintChecker, tag: Tag): Notice[] {
            let abstract = tag.arguments;

            if (abstract.indexOf("[") >= 0 || abstract.indexOf("]") >= 0 || abstract.indexOf("<br") >= 0) {
                let msg = Translation.bugAbstractSuspecious(tag.name);
                let notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        handleUniversalArgumentFormat(this: ConstraintChecker, tag: Tag, regex: RegExp, hint: string): Notice[] {
            let match = tag.arguments.match(regex);
            if (!match) {
                let msg = Translation.argumentMalformed(tag.name, hint);
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        handleUniversalDeprecated(this: ConstraintChecker, tag: Tag): Notice[] {
            let msg = Translation.bugDeprecated(tag.name);
            let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        }

        handleUniversalInnerLength(this: ConstraintChecker, tag: Tag, length: int, considerEscape: boolean): Notice[] {
            let current: number = tag.getInnerRange().length;

            if (considerEscape) {
                current = Def.secureText(tag.getInnerRange().getText(this.source)).length;
            }

            if (current > length) {
                let msg = Translation.constraintInnerTooLong(tag.name, length);
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        handleUniversalNotRecommended(this: ConstraintChecker, tag: Tag): Notice[] {
            let msg = Translation.bugNotRecommended(tag.name);
            let notice = new Notice(NoticeLevel.Warning, tag.startAt, msg);
            return [notice];
        }

        handleUniversalParamenterless(this: ConstraintChecker, tag: Tag): Notice[] {
            if (tag.arguments.length > 0) {
                let msg = Translation.argumentNotSupported(tag.name);
                let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
                return [notice];
            }

            return [];
        }

        handleUniversalRequireFixsize(this: ConstraintChecker, tag: Tag): Notice[] {
            let parent = tag.parent;

            while (parent !== Tag.rootSign) {
                if (parent === null) Util.bug();

                if (parent.name === "collapse" || parent.name === "randomblock") {
                    for (let i = 0; i < parent.children.length; i++) {
                        if (parent.children[i].name === "fixsize") {
                            return [];
                        }
                    }

                    break;
                }

                parent = parent.parent;
            }

            let msg = Translation.constraintRequireFixsize(tag.name);
            let notice = new Notice(NoticeLevel.Error, tag.startAt, msg);
            return [notice];
        }

        // --- helpers ---

        getNextArgToken(str: string): TokenConsumable {
            let match = str.match(/^([\s\=]*)([^\s\=]+|$)/);
            if (!match) {
                return new TokenConsumable("", str, new TextRange(0, 0), false);
            }

            let pos = new TextRange(0, match[0].length)
            return new TokenConsumable(match[2], str.substring(match[0].length), pos, match[1].indexOf("=") >= 0);
        }

        parseStyleArguments(this: ConstraintChecker, tag: Tag, desc: styleArgumentDesc): { routes: ArgRoute[], notices: Notice[] } {
            let args = tag.arguments;
            let argRange = tag.argumentRange;
            let notices: Notice[] = [];
            let routes: ArgRoute[] = [];

            while (args.trim().length > 0) {
                let next = this.getNextArgToken(args);
                let name = next.token;
                argRange = argRange.popFront(next.consumed.length);
                args = next.newText;
                let keyRange = argRange.lookBack(name.length);

                if (!desc.hasOwnProperty(name) || next.isRhs) {
                    let msg = Translation.argumentUnknown(tag.name, name);
                    let notice = new Notice(NoticeLevel.Error, keyRange, msg);
                    notices.push(notice);
                    continue;
                }

                let argMatch = desc[name];
                let matched = false;
                for (let rule in argMatch) {
                    if (!argMatch.hasOwnProperty(rule)) continue;

                    let regex = "^";
                    for (let i = 0; i < argMatch[rule].length; i++) {
                        regex += `\\s+(${argMatch[rule][i].source})(?=\\s|$)`;
                    }

                    let matcher = new RegExp(regex);
                    let match = args.match(matcher);
                    if (match) {
                        let values: string[] = [];
                        for (let i = 0; i < argMatch[rule].length; i++) {
                            values.push(match[i + 1]);
                        }
                        let route = new ArgRoute(rule, name, values, keyRange);
                        routes.push(route);
                        argRange = argRange.popFront(match[0].length);
                        args = args.substring(match[0].length);
                        matched = true;
                        break;
                    }
                }

                if (!matched) {
                    let msg = Translation.argumentError(tag.name, name);
                    let notice = new Notice(NoticeLevel.Error, keyRange, msg);
                    notices.push(notice);
                    continue;
                }
            }

            return { routes, notices };
        }
    }

    class SpecialTag {
        name: string;
        regex: RegExp;

        constructor(n: string, r: RegExp) {
            this.name = n;
            this.regex = r;
        }
    }

    class Def {
        // interlacing (single-side only) or juxtaposing these tags will not generate errors
        static styleTags: string[] =
            ["align", "b", "color", "del", "font", "h", "hltxt", "i", "l", "r", "size", "sub", "sup", "u", "upup", "url"];

        // these tags are other paired tags. juxtaposing will generate error.
        static functionTags: string[] = [
            "album", "attach", "chartradar", "code", "collapse", "crypt", "customachieve", "dice", "flash", "headline",
            "iframe", "img", "list", "omit", "pid", "quote", "randomblock", "span", "stid", "style", "table", 
            "td", "tid", "tr", "uid", "urlreplace"
        ];

        // these are atom tags
        static atomTags: string[] =
            ["*", "cnarmory", "euarmory", "fixsize", "markdown", "stripbr", "symbol", "twarmory", "usarmory"];

        static pairedTags: string[] = [
            ...Def.styleTags, ...Def.functionTags
        ];

        static recognizedTags: string[] = [
            ...Def.pairedTags, ...Def.atomTags
        ];

        // these are special tags
        static specialTags: SpecialTag[] = [
            new SpecialTag("at", /\[@(.{2,20}?)\]/g),
            new SpecialTag("comment", /\[\/?comment (.+?)\]/g),
            new SpecialTag("heading", /(?:(=|-){3})(.{0,100}?)(?:\1{3,})/g),
            new SpecialTag("lessernuke", /\[\/?lessernuke(\d)?\]/g),
            new SpecialTag("smile", /\[s:(.{1,10}?)\]/g),
            new SpecialTag("t.178.com", /\[t\.178\.com\/(.+?)\]/g) // deprecated
        ];

        // special code units
        static codeUnits: SpecialTag[] = [
            new SpecialTag("br", /<br\s*\/?>/g),
            new SpecialTag("htmlentity", /&#(\d{2,8});/g),
            // new SpecialTag("htmlnamed", /&(nbsp|lt|gt|quot|amp);/g)
        ];

        static recognizedRegex: SpecialTag[] = [...Def.specialTags, ...Def.codeUnits];
        static recognizedSpecial: string[] = Def.recognizedRegex.map(x => x.name);

        static caseSensitiveTags: string[] = [...Def.atomTags, "customachieve", "omit", "style"];

        static tagRegex: RegExp = /\[(\/?)(\w+)(-?\d+|(?=[\s=])[^\]]{0,100}|)\]/g;

        static tagNormalize(name: string): string {
            var normalized = name.toLowerCase();

            if (Def.caseSensitiveTags.indexOf(normalized) >= 0) {
                return name;
            }

            return normalized;
        }

        // tag specific data
        static entityExempt: number[] = [39, 36, 92];
        static symbolList: string[] = ["bad", "close", "gear", "good", "img", "label", "link", "menu", "smile", "star", "tbody", "up"];
        static colorList: string[] = ["blue", "burlywood", "chocolate", "coral", "crimson", "darkblue", "darkred", "deeppink", 
            "firebrick", "gray", "green", "indigo", "limegreen", "orange", "orangered", "purple", "red", "royalblue", "sandybrown", 
            "seagreen", "sienna", "silver", "skyblue", "teal", "tomato"];
        static fontList: string[] = ["simhei", "simsun", "Arial", "Arial Black", "Book Antiqua", "Century Gothic", "Comic Sans MS", 
            "Courier New", "Georgia", "Impact", "Tahoma", "Times New Roman", "Trebuchet MS", "Script MT Bold", "Stencil", "Verdana", 
            "Lucida Console"];

        static fixsizeArgument: styleArgumentDesc = {
            // [paramName][ruleName][regexParamsNoCaptureGroup]
            width: {
                w2: [/\d+(?:\.\d+)?/, /\d+(?:\.\d+)?/],
                w1: [/\d+(?:\.\d+)?/],
            },
            height: {
                h1: [/\d+(?:\.\d+)?/],
            },
            background: {
                t2: [/transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/, /transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/],
                t1: [/transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/], // this is the bugged one
            },
        };

        static styleArgument: styleArgumentDesc = {
            // [paramName][ruleName][regexParamsNoCaptureGroup]
            rotate: {
                p: [/-?\d+(?:\.\d+)?/],
            },
            scale: {
                p: [/\d+(?:\.\d+)?/],
            },
            margin: {
                p4: [/auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/],
                p3: [/auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/],
                p2: [/auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/],
                p1: [/auto|\d+(?:\.\d+)?/],
            },
            padding: {
                p4: [/auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/],
                p3: [/auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/],
                p2: [/auto|\d+(?:\.\d+)?/, /auto|\d+(?:\.\d+)?/],
                p1: [/auto|\d+(?:\.\d+)?/],
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
                p: [/\.\/mon_\d{6}\/\d+\/[^\]\[]+\.(?:jpg|png|svg)/],
            },
            dybg: {
                p: [new RegExp(
                    "-?\d+(?:\.\d+)?\%" + ";" +
                    "-?\d+(?:\.\d+)?\%?" + ";" +
                    "-?\d+(?:\.\d+)?\%?" + ";" +
                    "-?\d+(?:\.\d+)?\%?" + ";" +
                    "-?\d+(?:\.\d+)?\%?" + ";" +
                    "\.\/mon_\d{6}\/\d+\/[^\]\[]+\.(?:png|jpg|jpeg|bmp|svg|gif)"
                )]
            }
        };

        static secureText(text: string): string {
            return text
                .replace(/</g,"&lt;")
                .replace(/>/g,"&gt;")
                .replace(/"/g,"&quot;")
                .replace(/'/g,"&#39;")
                .replace(/\$/g,"&#36;")
                .replace(/\x5C/g,"&#92;")
                .replace(/&lt;br *\/?&gt;/gi,"<br />");
        }
    }

    class ArgRoute {
        ruleName: string;
        key: string;
        value: string[];
        keyRange: TextRange;

        constructor(ruleName: string, key: string, value: string[], keyRange: TextRange) {
            this.ruleName = ruleName;
            this.key = key;
            this.value = value;
            this.keyRange = keyRange;
        }
    }

    class TokenConsumable {
        token: string;
        newText: string;
        consumed: TextRange;
        isRhs: boolean;

        constructor(token: string, newText: string, consumed: TextRange, isRhs: boolean) {
            this.token = token;
            this.newText = newText;
            this.consumed = consumed;
            this.isRhs = isRhs;
        }
    }

    class Util {
        static bug(): never {
            throw new Error("unreachable");
        }

        static toInt(num: number): int {
            if (Number.isInteger(num)) {
                return num;
            }

            if (num >= 0) {
                return Math.floor(num);
            } else {
                return Math.ceil(num);
            }
        }

        static isNotices(value: unknown): value is Notice[] {
            if (value instanceof Array) {
                for (let i = 0; i < value.length; i++) {
                    if (value[i] instanceof Notice) {
                        continue;
                    }
                    return false;
                }
                return true;
            }
            return false;
        }

        static isTag(value: unknown): value is Tag {
            return value instanceof Tag;
        }

        static isTextRange(value: unknown): value is TextRange {
            return value instanceof TextRange;
        }

        static hasValue(value: unknown): boolean {
            if ((value === null) || (value === undefined) || (value === NaN)) {
                return false;
            }

            return true;
        }
    }

    class Translation {
        static argumentError = (tag: string, arg: string) => `标签 ${tag} 的以下参数使用了非法值: ${arg}`;
        static argumentMalformed = (name: string, format: string) => `标签 ${name} 参数格式错误，预期: ${format}`;
        static argumentMissing = (tag: string, arg: string) => `标签 ${tag} 缺少以下必须参数: ${arg}`;
        static argumentNotSupported = (tag: string) => `标签 ${tag} 不应具有任何参数`;
        static argumentUnknown = (tag: string, arg: string) => `标签 ${tag} 包含了以下未知参数或参数值: ${arg}`;

        static constraintColorOptionRange = (name: string) => `颜色 ${name} 不受论坛支持`;
        static constraintEntityCodeRange = (name: string) => `转义序列 ${name} 不受论坛支持`;
        static constraintFixsizeContainer = () => `标签 Fixsize 仅可在 Collapse 或 Randomblock 区域内生效`;
        static constraintFontOptionRange = (name: string) => `字体 ${name} 不受论坛支持`;
        static constraintInnerTooLong = (name: string, length: number) => `标签 ${name} 现有内文过长，最大允许 ${length} 个经转义的字符`;
        static constraintRequireFixsize = (name: string) => `标签 ${name} 仅可在 Fixsize 区域内生效`;
        static constraintSizeOptionRange = (name: number) => `缩放 ${name}% 不受论坛支持`;
        static constraintSymbolOutOfRange = (name: string) => `符号名 ${name} 无法作为 Symbol 标签参数`;

        static pairingInterlacing = (name: string) => `标签 ${name} 的嵌套顺序存在错误`;
        static pairingMismatched = (name: string) => `标签 ${name} 无法在当前作用域内配对`;

        static tagUnrecognized = (name: string) => `未知的标签 ${name}`;

        static bugAbstractSuspecious = (name: string) => `标签 ${name} 的提纲部分可能无法正确支持显示方括号与换行符`;
        static bugBrInCode = () => `标签 Code 作用区域内的 Br 换行符仍将生效`;
        static bugChartradarFormat = () => `标签 Chartradar 中属性数值对数量错误可能引起论坛网页严重错误`;
        static bugCryptNotWorking = () => `标签 Crypt 如未使用修复脚本将无法正确解密`;
        static bugDeprecated = (name: string) => `标签 ${name} 已不受当前版本的论坛网站支持`;
        static bugFixsizeBg = () => `标签 Fixsize 中使用单参数背景色设置可能引起论坛网页严重错误`;
        static bugHeadlineMissingText = () => `标签 Headline 中缺少 Hltxt 标签或其内容可能引起论坛网页严重错误`;
        static bugLesserNuke = () => `标签 LesserNuke 会在发布时被清除，且有概率为您招来真正的禁言，请三思后行`;
        static bugMarkdown = () => `检测到 Markdown 模式，该模式下存在多个已知 bug 且不受语法检查器支持`;
        static bugNotRecommended = (name: string) => `标签 ${name} 已不推荐使用`;
        static bugTagInOmit = () => `标签 Omit 作用区域内使用任何标签均将导致全文显示错误`;
    }
}

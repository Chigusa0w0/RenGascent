"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var BBCode;
(function (BBCode) {
    var SyntaxChecker = (function () {
        function SyntaxChecker(text) {
            this.source = text;
            this.findings = [];
        }
        SyntaxChecker.prototype.tokenPass = function () {
            var tags;
            tags = [];
            while (true) {
                var match = Def.tagRegex.exec(this.source);
                if (!match)
                    break;
                var tagName = match[2];
                var isClosing = match[1] === "/";
                var param = match[3];
                var index = match.index;
                var length = match[0].length;
                if (Def.recognizedTags.indexOf(tagName) >= 0) {
                    var tag = this.commonParser(tagName, isClosing, param, index, length);
                    tags.push(tag);
                }
                else {
                    if (Def.recognizedSpecial.indexOf(tagName) < 0) {
                        this.issueUnrecognizedTag(tagName, isClosing, param, index, length);
                    }
                }
            }
            for (var i = 0; i < Def.recognizedRegex.length; i++) {
                while (true) {
                    var rule = Def.recognizedRegex[i];
                    var match = rule.regex.exec(this.source);
                    if (!match)
                        break;
                    var tagName = rule.name;
                    var index = match.index;
                    var length = match[0].length;
                    var tag = this.specialParser(tagName, match[0], index, length);
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
    BBCode.SyntaxChecker = SyntaxChecker;
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
                var length = end - start;
                return new TextRange(start, length);
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
                var length = end - start;
                return new TextRange(start, length);
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
    BBCode.Tag = Tag;
    var TagClosingDesc;
    (function (TagClosingDesc) {
        TagClosingDesc[TagClosingDesc["Opening"] = 0] = "Opening";
        TagClosingDesc[TagClosingDesc["Closing"] = 1] = "Closing";
        TagClosingDesc[TagClosingDesc["Atom"] = 2] = "Atom";
    })(TagClosingDesc = BBCode.TagClosingDesc || (BBCode.TagClosingDesc = {}));
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
    BBCode.TextRange = TextRange;
    var Notice = (function () {
        function Notice(level, range, message) {
            this.level = level;
            this.range = range;
            this.message = message;
        }
        return Notice;
    }());
    BBCode.Notice = Notice;
    var NoticeLevel;
    (function (NoticeLevel) {
        NoticeLevel[NoticeLevel["Success"] = 0] = "Success";
        NoticeLevel[NoticeLevel["Message"] = 1] = "Message";
        NoticeLevel[NoticeLevel["Warning"] = 2] = "Warning";
        NoticeLevel[NoticeLevel["Error"] = 3] = "Error";
    })(NoticeLevel = BBCode.NoticeLevel || (BBCode.NoticeLevel = {}));
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
                var name = next.token;
                argRange = argRange.popFront(next.consumed.length);
                args = next.newText;
                var keyRange = argRange.lookBack(name.length);
                if (!desc.hasOwnProperty(name) || next.isRhs) {
                    var msg = Translation.argumentUnknown(tag.name, name);
                    var notice = new Notice(NoticeLevel.Error, keyRange, msg);
                    notices.push(notice);
                    continue;
                }
                var argMatch = desc[name];
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
                        var route = new ArgRoute(rule, name, values, keyRange);
                        routes.push(route);
                        argRange = argRange.popFront(match[0].length);
                        args = args.substring(match[0].length);
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    var msg = Translation.argumentError(tag.name, name);
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
})(BBCode || (BBCode = {}));
//# sourceMappingURL=rengascent.syntax.js.map
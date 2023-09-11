"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeTextAnnotationObj = exports.FreeTextType = exports.TextJustification = void 0;
const annotation_types_1 = require("./annotation_types");
const annotation_errors_1 = require("./annotation_errors");
const writer_util_1 = require("../writer-util");
const util_1 = require("../util");
const appearance_stream_1 = require("../appearance-stream");
const resources_1 = require("../resources");
const content_stream_1 = require("../content-stream");
const fonts_1 = require("../fonts");
var TextJustification;
(function (TextJustification) {
    TextJustification[TextJustification["Left"] = 0] = "Left";
    TextJustification[TextJustification["Centered"] = 1] = "Centered";
    TextJustification[TextJustification["Right"] = 2] = "Right";
})(TextJustification = exports.TextJustification || (exports.TextJustification = {}));
var FreeTextType;
(function (FreeTextType) {
    FreeTextType[FreeTextType["FreeText"] = 0] = "FreeText";
    FreeTextType[FreeTextType["FreeTextCallout"] = 1] = "FreeTextCallout";
    FreeTextType[FreeTextType["FreeTextTypeWriter"] = 2] = "FreeTextTypeWriter";
})(FreeTextType = exports.FreeTextType || (exports.FreeTextType = {}));
class FreeTextAnnotationObj extends annotation_types_1.MarkupAnnotationObj {
    constructor() {
        super();
        this.defaultAppearance = new content_stream_1.ContentStream(); // /DA
        this.differenceRectangle = [];
        this.textJustification = TextJustification.Left; // /Q
        this.calloutLine = [];
        this.freeTextType = FreeTextType.FreeText;
        this.lineEndingStyle = annotation_types_1.LineEndingStyle.None;
        this.font = "/Helvetica";
        this.fontSize = 18;
        this.resources = undefined;
        this.textColor = undefined;
        this.type = "/FreeText";
        this.type_encoded = [47, 70, 114, 101, 101, 84, 101, 120, 116]; // = '/FreeText'
    }
    convertJustification(just) {
        switch (just) {
            case TextJustification.Left:
                return 0;
            case TextJustification.Centered:
                return 1;
            case TextJustification.Right:
                return 2;
            default:
                return 0;
        }
    }
    convertFreeTextType(ft) {
        switch (ft) {
            case FreeTextType.FreeText:
                return util_1.Util.convertStringToAscii("/FreeText");
            case FreeTextType.FreeTextCallout:
                return util_1.Util.convertStringToAscii("/FreeTextCallout");
            case FreeTextType.FreeTextTypeWriter:
                return util_1.Util.convertStringToAscii("/FreeTextTypeWriter");
            default:
                return util_1.Util.convertStringToAscii("/FreeText");
        }
    }
    writeAnnotationObject(cryptoInterface) {
        let ret = super.writeAnnotationObject(cryptoInterface);
        let font = this.factory.parser.getFonts().getFont(this.font);
        if (!font) {
            font = this.factory.parser.getFonts().addFont(this.font);
        }
        if (!this.resources) {
            this.resources = new resources_1.Resource();
        }
        if (!font.name) {
            throw Error("Selected font has no name");
        }
        this.resources.addFontDef({ name: font.name, refPtr: font.object_id });
        if (this.defaultAppearance.isEmpty()) {
            if (this.textColor) {
                this.defaultAppearance.addOperator("rg", [this.textColor.r, this.textColor.g, this.textColor.b]);
            }
            this.defaultAppearance.addOperator("Tf", [font.name, this.fontSize]);
        }
        if (!this.defaultStyleString || "" === this.defaultStyleString) {
            if (font.fontType === fonts_1.FontType.Type1) {
                if (!font.baseFont) {
                    throw Error("Type 1 font has no defined baseFont");
                }
                let font_family = font.baseFont.substring(1);
                this.defaultStyleString = `font:${this.fontSize}pt "${font_family}";`;
                if (this.color) {
                    this.defaultStyleString += `color:${util_1.Util.colorToHex(this.color)};`;
                }
            }
            else {
                this.defaultStyleString = undefined;
            }
        }
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.DEFAULT_APPEARANCE);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret.push(writer_util_1.WriterUtil.BRACKET_START);
        ret = ret.concat(this.defaultAppearance.writeContentStream(true));
        ret.push(writer_util_1.WriterUtil.BRACKET_END);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.TEXT_JUSTIFICATION);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(util_1.Util.convertNumberToCharArray(this.convertJustification(this.textJustification)));
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.IT);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(this.convertFreeTextType(this.freeTextType));
        ret.push(writer_util_1.WriterUtil.SPACE);
        if (this.calloutLine.length > 0) {
            ret = ret.concat(writer_util_1.WriterUtil.CALLOUT_LINE);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.calloutLine));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.lineEndingStyle !== annotation_types_1.LineEndingStyle.None) {
            ret = ret.concat(writer_util_1.WriterUtil.LINE_ENDING);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.convertLineEndingStyle(this.lineEndingStyle));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.defaultStyleString && this.defaultStyleString !== "") {
            ret = ret.concat(writer_util_1.WriterUtil.DEFAULT_STYLE_STRING);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret.push(writer_util_1.WriterUtil.BRACKET_START);
            ret = ret.concat(util_1.Util.convertStringToAscii(this.defaultStyleString));
            ret.push(writer_util_1.WriterUtil.BRACKET_END);
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.differenceRectangle && this.differenceRectangle.length > 0) {
            ret = ret.concat(writer_util_1.WriterUtil.DIFFERENCE_RECTANGLE);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.differenceRectangle));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.resources) {
            ret = ret.concat(writer_util_1.WriterUtil.RESOURCES);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.resources.writeResource());
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        return ret;
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/FreeText") {
            errorList.push(new annotation_errors_1.InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`));
        }
        errorList = errorList.concat(this.checkColor(this.textColor));
        if (this.calloutLine && this.calloutLine.length > 0 && this.freeTextType !== FreeTextType.FreeTextCallout) {
            console.log("Warning: Callout line only relevant for free text type: 'Callout'");
        }
        if (this.fontSize < 0) {
            errorList.push(new annotation_errors_1.InvalidFontSizeError("A font size < 0 is not allowed"));
        }
        if (typeof this.font === 'string' || this.font instanceof fonts_1.Font) {
            if (typeof this.font === 'string') {
                if (!this.font.startsWith("/")) {
                    this.font = `/${this.font}`;
                }
            }
            if (!this.factory.parser.getFonts().isRegisteredFont(this.font)) {
                errorList.push(new annotation_errors_1.InvalidFontError("Only fonts registered in the PDF and standard fonts are allowed"));
            }
        }
        else {
            errorList.push(new annotation_errors_1.InvalidFontError("Only fonts registered in the PDF and standard fonts are allowed"));
        }
        if (enact) {
            for (let error of errorList) {
                throw error;
            }
        }
        return errorList;
    }
    createDefaultAppearanceStream() {
        let font = this.factory.parser.getFonts().getFont(this.font);
        if (!font) {
            font = this.factory.parser.getFonts().addFont(this.font);
        }
        if (!font.name) {
            font.name = this.factory.parser.getFonts().getUnusedFontName();
        }
        this.appearanceStream = new appearance_stream_1.AppStream(this);
        this.appearanceStream.new_object = true;
        let xobj = new appearance_stream_1.XObjectObj();
        xobj.object_id = this.factory.parser.getFreeObjectId();
        xobj.new_object = true;
        xobj.bBox = this.rect;
        xobj.matrix = [1, 0, 0, 1, -this.rect[0], -this.rect[1]];
        if (!xobj.resources) {
            xobj.resources = new resources_1.Resource();
        }
        xobj.resources.addFontDef({ name: font.name, refPtr: font.object_id });
        let cs = new content_stream_1.ContentStream();
        xobj.contentStream = cs;
        let cmo = cs.addMarkedContentObject(["/Tx"]);
        let go = cmo.addGraphicObject();
        go.setFillColor(this.color);
        go.fillRect(this.rect[0], this.rect[1], this.rect[2], this.rect[3]);
        let to = go.addTextObject();
        to.setColor(this.textColor);
        to.setFont(font.name, this.fontSize);
        to.formatText(this.contents, font, this.fontSize, this.rect, this.textJustification);
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
}
exports.FreeTextAnnotationObj = FreeTextAnnotationObj;
//# sourceMappingURL=freetext_annotation.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontManager = exports.Font = exports.FontType = void 0;
const font_data_1 = require("./font-data");
const writer_util_1 = require("./writer-util");
const util_1 = require("./util");
var FontType;
(function (FontType) {
    FontType[FontType["Type0"] = 0] = "Type0";
    FontType[FontType["Type1"] = 1] = "Type1";
    FontType[FontType["Type3"] = 2] = "Type3";
    FontType[FontType["MMType1"] = 3] = "MMType1";
    FontType[FontType["TrueType"] = 4] = "TrueType";
    FontType[FontType["CIDFontType0"] = 5] = "CIDFontType0";
    FontType[FontType["CIDFontType2"] = 6] = "CIDFontType2";
})(FontType = exports.FontType || (exports.FontType = {}));
class Font {
    constructor(fontType = undefined, name = undefined, baseFont = undefined) {
        this.object_id = undefined;
        /**
         * Determines if the font must be written to the PDF document, since it is not yet defined
         * */
        this.is_new = false;
        this.fontType = undefined;
        this.name = undefined;
        this.baseFont = undefined;
        this.firstChar = undefined;
        this.lastChar = undefined;
        this.widths = undefined;
        this.fontDescriptor = undefined;
        this.encoding = undefined;
        this.kernings = undefined;
        this.fontType = fontType;
        this.name = name;
        this.baseFont = baseFont;
        if (this.name && !this.name.startsWith("/")) {
            this.name = `/${this.name}`;
        }
        if (this.baseFont && !this.baseFont.startsWith("/")) {
            this.baseFont = `/${this.baseFont}`;
        }
        if (this.baseFont && Font.isStandardFont(this.baseFont)) {
            this.populateStandardFontData(this.baseFont);
            if (!this.widths) {
                throw Error(`No widths found for standard font "${this.baseFont}"`);
            }
        }
    }
    /**
     * Calculates the dimensions of the text using this font
     *
     * It also proposes linebreak positions for the provided width
     * */
    proposeLinebreaks(text, fontSize, width) {
        if (!this.widths) {
            return [];
        }
        if (!this.firstChar) {
            this.firstChar = 0;
        }
        let ascii = this.getTextWidthArray(text, fontSize);
        let positions = [];
        let line_width = 0, last_space = -1, last_pos = 0;
        for (let l = 0; l < ascii.length; ++l) {
            if (text.charAt(l) === " ") {
                last_space = l;
            }
            if (line_width + ascii[l] > width) {
                // backtrack to last space in the same line and move remainder in the next line
                if (last_space !== -1) {
                    positions.push({ start: last_pos, end: last_space - 1, width: ascii.slice(last_pos, last_space).reduce((x, y) => x + y, 0) });
                    l = last_space + 1;
                    last_pos = l;
                    last_space = -1;
                }
                else { // if no such last space is in the line return line_width - last letter width
                    positions.push({ start: last_pos, end: l - 1, width: ascii.slice(last_pos, l).reduce((x, y) => x + y, 0) });
                    last_pos = l;
                }
                line_width = 0;
            }
            line_width += ascii[l];
        }
        if (last_pos !== ascii.length) {
            positions.push({ start: last_pos, end: ascii.length - 1, width: ascii.slice(last_pos, ascii.length).reduce((x, y) => x + y, 0) });
        }
        return positions;
    }
    /**
     * Calculates the dimensions of the text using this font
     *
     * Returns [width, height]
     * */
    calculateTextDimensions(text, fontSize) {
        let widths = this.getTextWidthArray(text, fontSize);
        // calculate the sum of the widths array
        return [widths.reduce((pv, cv) => pv + cv, 0), fontSize];
    }
    /**
     * Calculates the dimensions of the text using this font in mm
     *
     * Returns [width, height]
     * */
    calculateTextDimensionsInMM(text, fontSize) {
        let values = this.calculateTextDimensions(text, fontSize);
        return [values[0] * 25.4 / 72, values[1]];
    }
    /**
     * Helper method to lookup the kerning value
     * */
    getKerningValue(previousChar, currentChar) {
        if (!this.kernings)
            return 0;
        let list = this.kernings.get(previousChar);
        if (!list)
            return 0;
        list = list.filter((x) => x[0] === currentChar);
        if (list.length === 1) {
            return list[0][1];
        }
        return 0;
    }
    /**
     * Returns the array of letter widths that are contained in the string
     * */
    getTextWidthArray(text, fontSize) {
        if (!this.widths) {
            return [];
        }
        if (!this.firstChar) {
            this.firstChar = 0;
        }
        let ascii = util_1.Util.convertStringToAscii(text);
        let ret_val = [];
        let previous_char = -1;
        for (let letter of ascii) {
            let kerning_value = 0;
            if (previous_char != -1 && this.kernings) {
                kerning_value = this.getKerningValue(previous_char, letter);
            }
            ret_val.push((this.widths[letter - this.firstChar] + kerning_value) / 1000 * fontSize);
            previous_char = letter;
        }
        return ret_val;
    }
    /**
     * Returns the widths array of a standard font
     * */
    populateStandardFontData(font_name) {
        if (font_name.startsWith("/")) {
            font_name = font_name.substring(1);
        }
        let key = Object.keys(font_data_1.STANDARD_FONT_DATA).filter(name => font_name.localeCompare(name) === 0);
        if (!key || key.length === 0 || key.length > 1) {
            throw Error(`No font widths for standard font ${font_name}`);
        }
        let font_data = font_data_1.STANDARD_FONT_DATA[key[0]];
        if (!font_data) {
            throw Error(`No font data for standard font ${font_name}`);
        }
        this.widths = font_data.widths;
        this.firstChar = font_data.firstChar;
        this.lastChar = font_data.lastChar;
        this.fontDescriptor = {
            fontName: this.baseFont,
            fontFamily: font_data.familyName,
            fontWeight: font_data.fontWeight,
            italicAngle: font_data.italicAngle,
            fontBBox: font_data.fontBBox,
            capHeight: font_data.capHeight,
            xHeight: font_data.xHeight,
            ascent: font_data.ascent,
            descent: font_data.descent,
            stemH: font_data.stemH,
            stemV: font_data.stemV,
            flags: font_data.flag
        };
        // setup hash map that contains the kerning data
        if (font_data.kernings) {
            this.kernings = new Map();
            for (let value of font_data.kernings) {
                let _list = [];
                if (this.kernings.has(value[0])) {
                    _list = this.kernings.get(value[0]);
                }
                _list.push(value.slice(1));
                this.kernings.set(value[0], _list);
            }
        }
    }
    /**
     * Returns a standard font
     * fontName the name reference the font name
     * baseFont the standard font
     * */
    static createStandardFont(object_id, fontName, baseFont) {
        let font = new Font(FontType.Type1, fontName, baseFont);
        font.object_id = object_id;
        return font;
    }
    /**
     * True, if the name is a standard font name
     * */
    static isStandardFont(name) {
        if (name.startsWith("/")) {
            name = name.substring(1);
        }
        switch (name) {
            case "Times-Roman":
                return true;
            case "Times-Bold":
                return true;
            case "Times-Italic":
                return true;
            case "Times-BoldItalic":
                return true;
            case "Helvetica":
                return true;
            case "Helvetica-Bold":
                return true;
            case "Helvetica-Oblique":
                return true;
            case "Helvetica-BoldOblique":
                return true;
            case "Courier":
                return true;
            case "Courier-Oblique":
                return true;
            case "Courier-BoldOblique":
                return true;
            case "Courier-Bold":
                return true;
            case "Symbol":
                return true;
            case "ZapfDingbats":
                return true;
            default:
                return false;
        }
    }
    typeToNumberArray(fontType) {
        switch (fontType) {
            case FontType.Type0:
                return writer_util_1.WriterUtil.TYPE0;
                break;
            case FontType.Type1:
                return writer_util_1.WriterUtil.TYPE1;
                break;
            case FontType.Type3:
                return writer_util_1.WriterUtil.TYPE3;
                break;
            case FontType.MMType1:
                return writer_util_1.WriterUtil.MMTYPE1;
                break;
            case FontType.TrueType:
                return writer_util_1.WriterUtil.TRUETYPE;
                break;
            case FontType.CIDFontType0:
                return writer_util_1.WriterUtil.CIDFONTTYPE0;
                break;
            case FontType.CIDFontType2:
                return writer_util_1.WriterUtil.CIDFONTTYPE2;
                break;
        }
        return [];
    }
    writeFontDescriptor() {
        if (!this.fontDescriptor)
            return [];
        let ret = [];
        ret = ret.concat(writer_util_1.WriterUtil.DICT_START);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.TYPE_FONTDESCRIPTOR);
        ret.push(writer_util_1.WriterUtil.SPACE);
        if (this.baseFont) {
            ret = ret.concat(writer_util_1.WriterUtil.FONTNAME);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertStringToAscii(this.baseFont));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.fontFamily) {
            ret = ret.concat(writer_util_1.WriterUtil.FONTFAMILY);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertStringToByteString(this.fontDescriptor.fontFamily));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.fontStretch) {
            ret = ret.concat(writer_util_1.WriterUtil.FONTSTRETCH);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertStringToAscii(this.fontDescriptor.fontStretch));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.flags) {
            ret = ret.concat(writer_util_1.WriterUtil.FLAGS);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.flags));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.fontBBox) {
            ret = ret.concat(writer_util_1.WriterUtil.FONTBBOX);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.fontDescriptor.fontBBox));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.italicAngle) {
            ret = ret.concat(writer_util_1.WriterUtil.ITALICANGLE);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.italicAngle));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.ascent) {
            ret = ret.concat(writer_util_1.WriterUtil.ASCENT);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.ascent));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.descent) {
            ret = ret.concat(writer_util_1.WriterUtil.DESCENT);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.descent));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.leading) {
            ret = ret.concat(writer_util_1.WriterUtil.LEADING);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.leading));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.capHeight) {
            ret = ret.concat(writer_util_1.WriterUtil.CAPHEIGHT);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.capHeight));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.xHeight) {
            ret = ret.concat(writer_util_1.WriterUtil.XHEIGHT);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.xHeight));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.stemV) {
            ret = ret.concat(writer_util_1.WriterUtil.STEMV);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.stemV));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.stemH) {
            ret = ret.concat(writer_util_1.WriterUtil.STEMH);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.stemH));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.avgWidth) {
            ret = ret.concat(writer_util_1.WriterUtil.AVGWIDTH);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.avgWidth));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.maxWidth) {
            ret = ret.concat(writer_util_1.WriterUtil.MAXWIDTH);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.maxWidth));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor.missingWidth) {
            ret = ret.concat(writer_util_1.WriterUtil.MISSINGWIDTH);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.fontDescriptor.missingWidth));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        ret = ret.concat(writer_util_1.WriterUtil.DICT_END);
        ret.push(writer_util_1.WriterUtil.SPACE);
        return ret;
    }
    writeFont() {
        if (!this.object_id)
            throw Error("object_id of font not set");
        let ret = writer_util_1.WriterUtil.writeReferencePointer(this.object_id);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.OBJ);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.DICT_START);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.TYPE_FONT);
        ret.push(writer_util_1.WriterUtil.SPACE);
        if (!this.fontType) {
            throw Error("Font Type not set");
        }
        ret = ret.concat(writer_util_1.WriterUtil.SUBTYPE);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(this.typeToNumberArray(this.fontType));
        ret.push(writer_util_1.WriterUtil.SPACE);
        if (this.baseFont) {
            ret = ret.concat(writer_util_1.WriterUtil.BASEFONT);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertStringToAscii(this.baseFont));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.firstChar) {
            ret = ret.concat(writer_util_1.WriterUtil.FIRSTCHAR);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.firstChar));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.lastChar) {
            ret = ret.concat(writer_util_1.WriterUtil.LASTCHAR);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.lastChar));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.widths) {
            ret = ret.concat(writer_util_1.WriterUtil.WIDTHS);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.widths));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.fontDescriptor) {
            ret = ret.concat(writer_util_1.WriterUtil.FONTDESCRIPTOR);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.writeFontDescriptor());
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.encoding) {
            ret = ret.concat(writer_util_1.WriterUtil.ENCODING);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertStringToAscii(this.encoding));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        ret = ret.concat(writer_util_1.WriterUtil.DICT_END);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.ENDOBJ);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        return ret;
    }
}
exports.Font = Font;
class FontManager {
    constructor(parser) {
        this.parser = parser;
        /**
         * The fonts in the document
         * */
        this.fonts = [];
    }
    /**
     * Returns the font with the corresponding reference pointer or name or basefont
     *
     * If there is no such font it returns undefined
     * */
    getFont(font) {
        for (let f of this.fonts) {
            if (typeof font === 'string') {
                if (f.name === font || f.baseFont === font)
                    return f;
            }
            else if (font instanceof Font) {
                if (font.object_id && f.object_id) {
                    if (f.object_id.obj === font.object_id.obj && f.object_id.generation === font.object_id.generation)
                        return f;
                }
                else if (font.name && f.name) {
                    if (f.name === font.name)
                        return f;
                }
                else if (font.baseFont && f.baseFont) {
                    if (f.baseFont === font.baseFont)
                        return f;
                }
            }
            else {
                if (f.object_id.obj === font.obj && f.object_id.generation === font.generation)
                    return f;
            }
        }
        return undefined;
    }
    /**
     * Adds a font, if it does not already exists.
     * */
    addFont(font) {
        if (this.hasFont(font)) {
            return undefined;
        }
        if (typeof font === "string") {
            if (Font.isStandardFont(font)) {
                font = Font.createStandardFont(this.parser.getFreeObjectId(), this.getUnusedFontName(), font);
                font.is_new = true;
            }
        }
        if (!(font instanceof Font)) {
            throw Error('Could not add font');
        }
        this.fonts.push(font);
        return font;
    }
    /**
     * Returns a font name that is not used yet
     * */
    getUnusedFontName() {
        let font_name = `/F${this.fonts.length}`;
        let i = 1;
        while (this.hasFont(font_name)) {
            font_name = `/F${this.fonts.length + i++}`;
        }
        return font_name;
    }
    /**
     * Retutrns true, if the font is already part of the font manager
     *
     * Font can be a Font object, a reference pointer of a font object a font name or a base font
     * */
    hasFont(font_ptr) {
        if (font_ptr instanceof Font && font_ptr.object_id) {
            font_ptr = font_ptr.object_id;
        }
        else if (typeof font_ptr === "string") {
            return this.fonts.filter(f => f.name === font_ptr ||
                f.baseFont === font_ptr).length > 0;
        }
        return this.fonts.filter(f => f.object_id && f.object_id.obj === font_ptr.obj &&
            f.object_id.generation === font_ptr.generation).length > 0;
    }
    /**
     * Returns true, if the font with the given name is registered, or if it is the name of a standard font.
     * */
    isRegisteredFont(font) {
        if (typeof font === 'string') {
            if (Font.isStandardFont(font))
                return true;
            for (let _font of this.fonts) {
                if (_font.name === font) {
                    return true;
                }
            }
        }
        else if (font instanceof Font) {
            for (let _font of this.fonts) {
                if (_font.name === font.name) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Returns the new fonts that must be appended to the document
     * */
    getFontsToWrite() {
        return this.fonts.filter(x => x.is_new);
    }
}
exports.FontManager = FontManager;
//# sourceMappingURL=fonts.js.map
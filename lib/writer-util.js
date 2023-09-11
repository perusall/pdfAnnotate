"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriterUtil = void 0;
const util_1 = require("./util");
const stream_1 = require("./stream");
class WriterUtil {
    /**
     * Writes a reference pointer
     *
     * <obj_id> <generation> R
     *
     * The 'R' and the preceding space is only written in case 'referenced' is true
     * */
    static writeReferencePointer(ref, referenced = false) {
        let ret = util_1.Util.convertNumberToCharArray(ref.obj);
        ret.push(util_1.Util.SPACE);
        ret = ret.concat(util_1.Util.convertNumberToCharArray(ref.generation));
        if (referenced) {
            ret.push(util_1.Util.SPACE);
            ret.push(...util_1.Util.R);
        }
        return ret;
    }
    /**
     * Adds preceding zeros (0) in front of the 'value' to match the length
     * */
    static pad(length, value) {
        value = String(value);
        let ret = [];
        for (let i = 0; i < length - value.length; ++i) {
            ret.push(48);
        }
        ret = ret.concat(util_1.Util.convertNumberToCharArray(value));
        return ret;
    }
    /**
     * Writes a nested number array
     * */
    static writeNestedNumberArray(array) {
        let ret = [...util_1.Util.ARRAY_START];
        for (let subArray of array) {
            ret = ret.concat(WriterUtil.writeNumberArray(subArray));
            ret.push(util_1.Util.SPACE);
        }
        ret.push(...util_1.Util.ARRAY_END);
        return ret;
    }
    /**
     * Writes a javascript number array to a PDF number array
     * */
    static writeNumberArray(array) {
        let ret = [...util_1.Util.ARRAY_START];
        for (let i of array) {
            ret = ret.concat(util_1.Util.convertNumberToCharArray(i));
            ret.push(util_1.Util.SPACE);
        }
        ret.push(...util_1.Util.ARRAY_END);
        return ret;
    }
    /**
     * Replaces the /Annots field in an page object
     *
     * ptr : Pointer to the page object
     * annot_array_reference : The reference to the annotation array
     * */
    static replaceAnnotsFieldInPageObject(data, page, page_ptr, annot_array_reference) {
        let ptr_objend = util_1.Util.locateSequence(util_1.Util.ENDOBJ, data, page_ptr, true);
        let complete_page_object_data = data.slice(page_ptr, ptr_objend + util_1.Util.ENDOBJ.length);
        let ret = [];
        if (page.hasAnnotsField) {
            // in this case the page object directly contains an array of references and
            // does not point to an array array object -- we replace the array of references with a pointer
            // to the reference array
            let ptr_annots = util_1.Util.locateSequence(util_1.Util.ANNOTS, complete_page_object_data, 0, true);
            ret = Array.from(complete_page_object_data.slice(0, ptr_annots + util_1.Util.ANNOTS.length));
            ret.push(util_1.Util.SPACE);
            ret = ret.concat(WriterUtil.writeReferencePointer(annot_array_reference, true));
            ret.push(util_1.Util.SPACE);
            let ptr_annots_array_end = util_1.Util.locateSequence(util_1.Util.ARRAY_END, complete_page_object_data, ptr_annots, true) + util_1.Util.ARRAY_END.length;
            ret = ret.concat(Array.from(complete_page_object_data.slice(ptr_annots_array_end, complete_page_object_data.length)));
        }
        else {
            let ptr_dict_end = util_1.Util.locateSequenceReversed(util_1.Util.DICT_END, complete_page_object_data, complete_page_object_data.length - 1);
            if (-1 === ptr_dict_end)
                throw Error("Could not identify dictionary end");
            ret = Array.from(complete_page_object_data.slice(0, ptr_dict_end));
            ret = ret.concat(util_1.Util.ANNOTS);
            ret.push(util_1.Util.SPACE);
            ret = ret.concat(WriterUtil.writeReferencePointer(annot_array_reference, true));
            ret.push(util_1.Util.SPACE);
            ret = ret.concat(Array.from(complete_page_object_data.slice(ptr_dict_end, complete_page_object_data.length)));
        }
        ret.push(util_1.Util.CR);
        ret.push(util_1.Util.LF);
        return ret;
    }
    /**
     * Writes the given object as stream object. Handels all the necessary stuff
     * object_id: The reference pointer id and generation
     * dict: dictionary fields that must be added to the stream object. Must be already encoded in bytes
     * stream: The stream content. Note, that the stream output will be only compressed if you provide a stream object. Number arrays will be processed unaltered.
     * */
    static writeStreamObject(object_id, dict, stream) {
        let streamData = stream;
        let compressed = false;
        if (stream instanceof stream_1.Stream) {
            streamData = Array.from(stream.encode());
            compressed = true;
        }
        let ret = WriterUtil.writeReferencePointer(object_id);
        ret.push(WriterUtil.SPACE);
        ret = ret.concat(WriterUtil.OBJ);
        ret.push(WriterUtil.CR);
        ret.push(WriterUtil.LF);
        ret = ret.concat(WriterUtil.DICT_START);
        ret.push(WriterUtil.SPACE);
        if (compressed) {
            ret = ret.concat(WriterUtil.FILTER);
            ret.push(WriterUtil.SPACE);
            ret = ret.concat(WriterUtil.FLATEDECODE);
            ret.push(WriterUtil.SPACE);
        }
        ret = ret.concat(WriterUtil.LENGTH);
        ret.push(WriterUtil.SPACE);
        ret = ret.concat(util_1.Util.convertNumberToCharArray(streamData.length));
        ret.push(WriterUtil.SPACE);
        ret = ret.concat(dict);
        ret = ret.concat(WriterUtil.DICT_END);
        ret = ret.concat(WriterUtil.STREAM);
        ret.push(WriterUtil.CR);
        ret.push(WriterUtil.LF);
        ret = ret.concat(streamData);
        ret.push(WriterUtil.CR);
        ret.push(WriterUtil.LF);
        ret = ret.concat(WriterUtil.ENDSTREAM);
        ret.push(WriterUtil.CR);
        ret.push(WriterUtil.LF);
        ret = ret.concat(WriterUtil.ENDOBJ);
        ret.push(WriterUtil.CR);
        ret.push(WriterUtil.LF);
        return ret;
    }
}
exports.WriterUtil = WriterUtil;
WriterUtil.N = 110;
WriterUtil.F = 102;
WriterUtil.q = 113;
WriterUtil.Q = 81;
WriterUtil.BT = [66, 84]; // = 'BT'
WriterUtil.ET = [69, 84]; // = 'ET'
WriterUtil.BMC = [66, 77, 67]; // = 'BMC'
WriterUtil.EMC = [69, 77, 67]; // = 'EMC'
WriterUtil.AP_N = [47, 78]; // = '/N'
WriterUtil.AP_D = [47, 68]; // = '/D'
WriterUtil.AP_R = [47, 82]; // = '/R'
WriterUtil.SPACE = 32;
WriterUtil.CR = 13;
WriterUtil.LF = 10;
WriterUtil.AP = [47, 65, 80]; // = '/AP'
WriterUtil.OBJ = [111, 98, 106];
WriterUtil.ENDOBJ = [101, 110, 100, 111, 98, 106];
WriterUtil.ENCRYPT = [47, 69, 110, 99, 114, 121, 112, 116];
WriterUtil.ARRAY_START = 91;
WriterUtil.OPEN = [47, 79, 112, 101, 110];
WriterUtil.ARRAY_END = 93;
WriterUtil.DICT_START = [60, 60];
WriterUtil.HEX_STRING_START = [60];
WriterUtil.HEX_STRING_END = [62];
WriterUtil.DICT_END = [62, 62];
WriterUtil.TYPE0 = [47, 84, 121, 112, 101, 48]; // /Type0
WriterUtil.TYPE1 = [47, 84, 121, 112, 101, 49]; // /Type1
WriterUtil.TYPE3 = [47, 84, 121, 112, 101, 51]; // /Type3
WriterUtil.MMTYPE1 = [47, 77, 77, 84, 121, 112, 101, 49]; // /MMType1
WriterUtil.TRUETYPE = [47, 84, 114, 117, 101, 84, 121, 112, 101]; // /TrueType
WriterUtil.CIDFONTTYPE0 = [47, 67, 73, 68, 70, 111, 110, 116, 84, 121, 112, 101, 48]; // /CIDFontType0
WriterUtil.CIDFONTTYPE2 = [47, 67, 73, 68, 70, 111, 110, 116, 84, 121, 112, 101, 50]; // /CIDFontType2
WriterUtil.TYPE_ANNOT = [47, 84, 121, 112, 101, WriterUtil.SPACE, 47, 65, 110, 110, 111, 116];
WriterUtil.TYPE_XOBJECT = [47, 84, 121, 112, 101, WriterUtil.SPACE, 47, 88, 79, 98, 106, 101, 99, 116];
WriterUtil.TYPE_EXTGSTATE = [47, 84, 121, 112, 101, WriterUtil.SPACE, 47, 69, 120, 116, 71, 83, 116, 97, 116, 101];
WriterUtil.TYPE_FONTDESCRIPTOR = [47, 84, 121, 112, 101, WriterUtil.SPACE, 47, 70, 111, 110, 116, 68, 101, 115, 99, 114, 105, 112, 116, 111, 114];
WriterUtil.TYPE_FONT = [47, 84, 121, 112, 101, WriterUtil.SPACE, 47, 70, 111, 110, 116];
WriterUtil.FONTNAME = [47, 70, 111, 110, 116, 78, 97, 109, 101]; // = '/FontName'
WriterUtil.FONTFAMILY = [47, 70, 111, 110, 116, 70, 97, 109, 105, 108, 121]; // = '/FontFamily'
WriterUtil.FONTSTRETCH = [47, 70, 111, 110, 116, 83, 116, 114, 101, 116, 99, 104]; // = '/FontStretch'
WriterUtil.FLAGS = [47, 70, 108, 97, 103, 115]; // = '/Flags'
WriterUtil.FONTBBOX = [47, 70, 111, 110, 116, 66, 66, 111, 120]; // = '/FontBBox'
WriterUtil.ITALICANGLE = [47, 73, 116, 97, 108, 105, 99, 65, 110, 103, 108, 101]; // = '/ItalicAngle'
WriterUtil.ASCENT = [47, 65, 115, 99, 101, 110, 116]; // = '/Ascent'
WriterUtil.DESCENT = [47, 68, 101, 115, 99, 101, 110, 116]; // = '/Descent'
WriterUtil.LEADING = [47, 76, 101, 97, 100, 105, 110, 103]; // = '/Leading'
WriterUtil.CAPHEIGHT = [47, 67, 97, 112, 72, 101, 105, 103, 104, 116]; // = '/CapHeight'
WriterUtil.XHEIGHT = [47, 88, 72, 101, 105, 103, 104, 116]; // = '/XHeight'
WriterUtil.STEMV = [47, 83, 116, 101, 109, 86]; // = '/StemV'
WriterUtil.ENCODING = [47, 69, 110, 99, 111, 100, 105, 110, 103]; // = '/Encoding'
WriterUtil.STEMH = [47, 83, 116, 101, 109, 2]; // = '/StemH'
WriterUtil.AVGWIDTH = [47, 65, 118, 103, 87, 105, 100, 116, 104]; // = '/AvgWidth'
WriterUtil.MAXWIDTH = [47, 77, 97, 120, 87, 105, 100, 116, 104]; // = '/MaxWidth'
WriterUtil.MISSINGWIDTH = [47, 77, 105, 115, 115, 105, 110, 103, 87, 105, 100, 116, 104]; // = '/MissingWidth'
WriterUtil.FIRSTCHAR = [47, 70, 105, 114, 115, 116, 67, 104, 97, 114]; // = '/FirstChar'
WriterUtil.LASTCHAR = [47, 76, 97, 115, 116, 67, 104, 97, 114]; // = '/LastChar'
WriterUtil.BASEFONT = [47, 66, 97, 115, 101, 70, 111, 110, 116]; // = '/BaseFont'
WriterUtil.WIDTHS = [47, 87, 105, 100, 116, 104, 115]; // = '/Widths'
WriterUtil.FONTDESCRIPTOR = [47, 70, 111, 110, 116, 68, 101, 115, 99, 114, 105, 112, 116, 111, 114]; // = '/FontDescriptor'
WriterUtil.XOBJECT = [47, 88, 79, 98, 106, 101, 99, 116]; // = '/XObject'
WriterUtil.EXTGSTATE = [47, 69, 120, 116, 71, 83, 116, 97, 116, 101]; // = '/ExtGState'
WriterUtil.COLORSPACE = [47, 67, 111, 108, 111, 114, 83, 112, 97, 99, 101]; // = '/ColorSpace'
WriterUtil.PATTERN = [47, 80, 97, 116, 116, 101, 114, 110]; // = '/Pattern'
WriterUtil.SHADING = [47, 83, 104, 97, 100, 105, 110, 103]; // = '/Shading'
WriterUtil.FONT = [47, 70, 111, 110, 116]; // = '/Font'
WriterUtil.PROCSET = [47, 80, 114, 111, 99, 83, 101, 116]; // = '/ProcSet'
WriterUtil.PROPERTIES = [47, 80, 114, 111, 112, 101, 114, 116, 105, 101, 115]; // = '/Properties'
WriterUtil.RECT = [47, 82, 101, 99, 116];
WriterUtil.RESOURCES = [47, 82, 101, 115, 111, 117, 114, 99, 101, 115]; // = '/Resources'
WriterUtil.SUBTYPE = [47, 83, 117, 98, 116, 121, 112, 101];
WriterUtil.FORM = [47, 70, 111, 114, 109]; // = '/Form'
WriterUtil.UPDATE_DATE = [47, 77]; // = '/M'
WriterUtil.AUTHOR = [47, 84]; // = '/T'
WriterUtil.CONTENTS = [47, 67, 111, 110, 116, 101, 110, 116, 115]; // = '/Contents'
WriterUtil.BRACKET_START = 40;
WriterUtil.BRACKET_END = 41;
WriterUtil.FLAG = [47, 70]; // = '/F'
WriterUtil.ID = [47, 78, 77]; // = '/NM'
WriterUtil.DOCUMENT_ID = [47, 73, 68]; // = '/ID'
WriterUtil.COLOR = [47, 67]; // = '/C'
WriterUtil.FILL = [47, 73, 67]; // = '/IC'
WriterUtil.STATE = [47, 83, 116, 97, 116, 101]; // = '/State'
WriterUtil.STATEMODEL = [47, 83, 116, 97, 116, 101, 77, 111, 100, 101, 108]; // = '/StateModel'
WriterUtil.OPACITY = [47, 67, 65]; // = '/CA'
WriterUtil._OPACITY = [47, 99, 97]; // = '/ca'
WriterUtil.BORDER = [47, 66, 111, 114, 100, 101, 114]; // = '/Border'
WriterUtil.PAGE_REFERENCE = [47, 80]; // = '/P'
WriterUtil.DEFAULT_APPEARANCE = [47, 68, 65]; // = '/DA'
WriterUtil.INKLIST = [47, 73, 110, 107, 76, 105, 115, 116]; // = '/InkList'
WriterUtil.FILTER = [47, 70, 105, 108, 116, 101, 114]; // = '/Filter'
WriterUtil.FLATEDECODE = [47, 70, 108, 97, 116, 101, 68, 101, 99, 111, 100, 101]; // = '/FlateDecode'
WriterUtil.LENGTH = [47, 76, 101, 110, 103, 116, 104]; // = '/Length'
WriterUtil.STREAM = [115, 116, 114, 101, 97, 109]; // = 'stream'
WriterUtil.ENDSTREAM = [101, 110, 100, 115, 116, 114, 101, 97, 109]; // = 'endstream'
WriterUtil.FORMTYPE = [47, 70, 111, 114, 109, 84, 121, 112, 101]; // = '/FormType'
WriterUtil.MATRIX = [47, 77, 97, 116, 114, 105, 120]; // = '/Matrix'
WriterUtil.BBOX = [47, 66, 66, 111, 120]; // = '/BBox'
WriterUtil.RC = [47, 82, 67]; // = '/RC'
WriterUtil.CREATION_DATE = [47, 67, 114, 101, 97, 116, 105, 111, 110, 68, 97, 116, 101]; // = '/CreationDate'
WriterUtil.SUBJ = [47, 83, 117, 98, 106]; // = '/Subj'
WriterUtil.TRAILER = [116, 114, 97, 105, 108, 101, 114]; // = 'trailer'
WriterUtil.SIZE = [47, 83, 105, 122, 101]; // = '/Size'
WriterUtil.ROOT = [47, 82, 111, 111, 116]; // = '/Root'
WriterUtil.PREV = [47, 80, 114, 101, 118]; // ='/Prev'
WriterUtil.STARTXREF = [115, 116, 97, 114, 116, 120, 114, 101, 102]; // = 'startxref'
WriterUtil.EOF = [37, 37, 69, 79, 70]; // = '%%EOF'
WriterUtil.TRUE = [116, 114, 117, 101]; // = 'true'
WriterUtil.XREF = [120, 114, 101, 102]; // = 'xref'
WriterUtil.TEXT_JUSTIFICATION = [47, 81]; // = '/Q'
WriterUtil.DEFAULT_STYLE_STRING = [47, 68, 83]; // = '/DS'
WriterUtil.DIFFERENCE_RECTANGLE = [47, 82, 68]; // = '/RD'
WriterUtil.IT = [47, 73, 84]; // = '/IT'
WriterUtil.LINE_ENDING = [47, 76, 69]; // = '/LE'
WriterUtil.CALLOUT_LINE = [47, 67, 76]; // = '/CL'
WriterUtil.QUADPOINTS = [47, 81, 117, 97, 100, 80, 111, 105, 110, 116, 115]; // = '/QuadPoints'
WriterUtil.VERTICES = [47, 86, 101, 114, 116, 105, 99, 101, 115]; // = '/Vertices'
WriterUtil.NAME = [47, 78, 97, 109, 101]; // = '/Name'
WriterUtil.DRAFT = [47, 68, 114, 97, 102, 116]; // = '/Draft'
WriterUtil.SY = [47, 83, 121]; // = '/Sy'
WriterUtil.P = 80;
//# sourceMappingURL=writer-util.js.map
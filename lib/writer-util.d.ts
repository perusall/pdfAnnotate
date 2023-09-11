import { Page, ReferencePointer } from './parser';
import { Stream } from './stream';
export declare class WriterUtil {
    static readonly N: number;
    static readonly F: number;
    static readonly q: number;
    static readonly Q: number;
    static readonly BT: number[];
    static readonly ET: number[];
    static readonly BMC: number[];
    static readonly EMC: number[];
    static readonly AP_N: number[];
    static readonly AP_D: number[];
    static readonly AP_R: number[];
    static readonly SPACE: number;
    static readonly CR: number;
    static readonly LF: number;
    static readonly AP: number[];
    static readonly OBJ: number[];
    static readonly ENDOBJ: number[];
    static readonly ENCRYPT: number[];
    static readonly ARRAY_START: number;
    static readonly OPEN: number[];
    static readonly ARRAY_END: number;
    static readonly DICT_START: number[];
    static readonly HEX_STRING_START: number[];
    static readonly HEX_STRING_END: number[];
    static readonly DICT_END: number[];
    static readonly TYPE0: number[];
    static readonly TYPE1: number[];
    static readonly TYPE3: number[];
    static readonly MMTYPE1: number[];
    static readonly TRUETYPE: number[];
    static readonly CIDFONTTYPE0: number[];
    static readonly CIDFONTTYPE2: number[];
    static readonly TYPE_ANNOT: number[];
    static readonly TYPE_XOBJECT: number[];
    static readonly TYPE_EXTGSTATE: number[];
    static readonly TYPE_FONTDESCRIPTOR: number[];
    static readonly TYPE_FONT: number[];
    static readonly FONTNAME: number[];
    static readonly FONTFAMILY: number[];
    static readonly FONTSTRETCH: number[];
    static readonly FLAGS: number[];
    static readonly FONTBBOX: number[];
    static readonly ITALICANGLE: number[];
    static readonly ASCENT: number[];
    static readonly DESCENT: number[];
    static readonly LEADING: number[];
    static readonly CAPHEIGHT: number[];
    static readonly XHEIGHT: number[];
    static readonly STEMV: number[];
    static readonly ENCODING: number[];
    static readonly STEMH: number[];
    static readonly AVGWIDTH: number[];
    static readonly MAXWIDTH: number[];
    static readonly MISSINGWIDTH: number[];
    static readonly FIRSTCHAR: number[];
    static readonly LASTCHAR: number[];
    static readonly BASEFONT: number[];
    static readonly WIDTHS: number[];
    static readonly FONTDESCRIPTOR: number[];
    static readonly XOBJECT: number[];
    static readonly EXTGSTATE: number[];
    static readonly COLORSPACE: number[];
    static readonly PATTERN: number[];
    static readonly SHADING: number[];
    static readonly FONT: number[];
    static readonly PROCSET: number[];
    static readonly PROPERTIES: number[];
    static readonly RECT: number[];
    static readonly RESOURCES: number[];
    static readonly SUBTYPE: number[];
    static readonly FORM: number[];
    static readonly UPDATE_DATE: number[];
    static readonly AUTHOR: number[];
    static readonly CONTENTS: number[];
    static readonly BRACKET_START: number;
    static readonly BRACKET_END: number;
    static readonly FLAG: number[];
    static readonly ID: number[];
    static readonly DOCUMENT_ID: number[];
    static readonly COLOR: number[];
    static readonly FILL: number[];
    static readonly STATE: number[];
    static readonly STATEMODEL: number[];
    static readonly OPACITY: number[];
    static readonly _OPACITY: number[];
    static readonly BORDER: number[];
    static readonly PAGE_REFERENCE: number[];
    static readonly DEFAULT_APPEARANCE: number[];
    static readonly INKLIST: number[];
    static readonly FILTER: number[];
    static readonly FLATEDECODE: number[];
    static readonly LENGTH: number[];
    static readonly STREAM: number[];
    static readonly ENDSTREAM: number[];
    static readonly FORMTYPE: number[];
    static readonly MATRIX: number[];
    static readonly BBOX: number[];
    static readonly RC: number[];
    static readonly CREATION_DATE: number[];
    static readonly SUBJ: number[];
    static readonly TRAILER: number[];
    static readonly SIZE: number[];
    static readonly ROOT: number[];
    static readonly PREV: number[];
    static readonly STARTXREF: number[];
    static readonly EOF: number[];
    static readonly TRUE: number[];
    static readonly XREF: number[];
    static readonly TEXT_JUSTIFICATION: number[];
    static readonly DEFAULT_STYLE_STRING: number[];
    static readonly DIFFERENCE_RECTANGLE: number[];
    static readonly IT: number[];
    static readonly LINE_ENDING: number[];
    static readonly CALLOUT_LINE: number[];
    static readonly QUADPOINTS: number[];
    static readonly VERTICES: number[];
    static readonly NAME: number[];
    static readonly DRAFT: number[];
    static readonly SY: number[];
    static readonly P: number;
    /**
     * Writes a reference pointer
     *
     * <obj_id> <generation> R
     *
     * The 'R' and the preceding space is only written in case 'referenced' is true
     * */
    static writeReferencePointer(ref: ReferencePointer, referenced?: boolean): number[];
    /**
     * Adds preceding zeros (0) in front of the 'value' to match the length
     * */
    static pad(length: number, value: string | number): number[];
    /**
     * Writes a nested number array
     * */
    static writeNestedNumberArray(array: number[][]): number[];
    /**
     * Writes a javascript number array to a PDF number array
     * */
    static writeNumberArray(array: number[]): number[];
    /**
     * Replaces the /Annots field in an page object
     *
     * ptr : Pointer to the page object
     * annot_array_reference : The reference to the annotation array
     * */
    static replaceAnnotsFieldInPageObject(data: Uint8Array, page: Page, page_ptr: number, annot_array_reference: ReferencePointer): number[];
    /**
     * Writes the given object as stream object. Handels all the necessary stuff
     * object_id: The reference pointer id and generation
     * dict: dictionary fields that must be added to the stream object. Must be already encoded in bytes
     * stream: The stream content. Note, that the stream output will be only compressed if you provide a stream object. Number arrays will be processed unaltered.
     * */
    static writeStreamObject(object_id: ReferencePointer, dict: number[], stream: Stream | number[]): number[];
}

import { ReferencePointer } from './parser';
import { Color } from './annotations/annotation_types';
/**
 * The result contains the extraction result and the
 * end_index always points to the last position that describes the extracted result.
 *
 * NOT ONE POSITION AHEAD AND NO TRAILING SPACES.
 * */
export interface ExtractionResult {
    result: any;
    start_index: number;
    end_index: number;
}
export interface PDFVersion {
    major: number;
    minor: number;
}
/**
 * This class provides methods to navigate through the byte array representing the PDF document
 * */
export declare class Util {
    static readonly VERSION: number[];
    static readonly COMMENT_START: number[];
    static readonly NULL: number[];
    static readonly DOT: number;
    static readonly CR: number;
    static readonly LF: number;
    static readonly TYPE: string;
    static readonly SPACE: number;
    static readonly OBJ: number[];
    static readonly ENDOBJ: number[];
    static readonly ARRAY_START: number[];
    static readonly ARRAY_END: number[];
    static readonly LITERAL_STRING_START: number[];
    static readonly HEX_STRING_START: number[];
    static readonly LITERAL_STRING_END: number[];
    static readonly HEX_STRING_END: number[];
    static readonly R: number[];
    static readonly ANNOTS: number[];
    static readonly DICT_START: number[];
    static readonly DICT_END: number[];
    static readonly PAGE: number[];
    static readonly SIZE: number[];
    static readonly ROOT: number[];
    static readonly PREV: number[];
    static readonly STARTXREF: number[];
    static readonly XREF: number[];
    static readonly STREAM: number[];
    static readonly TRAILER: number[];
    /**
     * Extracts the version information of a PDF file
     * */
    static extractVersion(data: Uint8Array, index?: number): PDFVersion;
    /**
     * Consumes comments that is
     *  '%.................. EOL'
     *
     *  Also handles mulitple line comments
     * */
    private static consumeComment;
    /**
     * Returns the next word. These are bytes that are not separated by a delimiter and a ptr to the position where the word ends
     * It ignores/skips comments.
     * */
    static readNextWord(data: Uint8Array, index?: number): ExtractionResult;
    /**
     * Assumes that at position index is a delimiter and than runs as long forward until it finds
     * another delimiter or reaches the end of the document
     * */
    static skipDelimiter(data: Uint8Array, index?: number): number;
    /**
     * Skips only spaces
     * */
    static skipSpaces(data: Uint8Array | number[], index?: number): number;
    /**
     * Skips the symbol specified by _symbol
     * */
    static skipSymbol(data: Uint8Array | number[], _symbol: number, index?: number): number;
    /**
     * Skips only spaces
     * */
    static skipSpacesReverse(data: Uint8Array | number[], index?: number): number;
    /**
     * Assumes that at position index is a delimiter and than runs as long backwards until it finds
     * another delimiter or reaches the end of the document
     * */
    static skipDelimiterReverse(data: Uint8Array, index?: number): number;
    /**
     * Transforms a string into an array of the corresponding ascii values
     * */
    static convertStringToAscii(toConvert: string): number[];
    static isSpace(value: number): boolean;
    static isDelimiter(value: number): boolean;
    static isNumber(value: number): boolean;
    /**
     * Search the sequence in data starting at the offset
     *
     * Set the 'closed' flag to check if the suceeding char after the sequence is a line feed (10), a carriage return (13), the end
     * of the whole sequence or a space (32)
     * */
    static locateSequence(sequence: number[], data: Uint8Array, offset?: number, closed?: boolean): number;
    /**
     * Search the sequence in data starting at the offset in reverse direction
     *
     * Set the 'closed' flag to check if the preceding char before the sequence is a line feed (10), a carriage return (13), the start
     * of the whole data sequence or a space (32)
     * */
    static locateSequenceReversed(sequence: number[], data: Uint8Array, offset?: number, closed?: boolean): number;
    /**
     * Locates the index before the next delimiter. Delimiters can be a line feed (10), a carriage return (13), the end of the whole sequence
     * or a space (32)
     * */
    static locateDelimiter(data: Uint8Array, offset?: number): number;
    /**
     * Locates the index after the last delimiter. Delimiters can be a line feed (10), a carriage return (13), the end of the whole sequence
     * or a space (32)
     * */
    static locateDelimiterReversed(data: Uint8Array, offset?: number): number;
    /**
     * Extract an object identifier
     * <ID> <GEN> obj
     * */
    static extractObjectId(data: Uint8Array, index: number): ReferencePointer;
    /**
     * Extract the reference starting at position 'index'
     * */
    static extractReference(data: Uint8Array, index: number): Uint8Array;
    /**
     * Returns a reference as typed object
     * */
    static extractReferenceTyped(data: Uint8Array, index: number): ExtractionResult;
    /**
     * Extracts a string in Hex notation <...>
     * */
    static extractHexString(data: Uint8Array, index: number): ExtractionResult;
    /**
     * Extratcs a string (...)
     * */
    static extractString(data: Uint8Array, index: number): ExtractionResult;
    /**
     * Returns the value of an option
     * /<option>
     *
     * so for instance for /Highlight it would return 'Highlight'
     *
     * The index must point to the "/"
     * */
    static extractOptionValue(data: Uint8Array, index?: number): ExtractionResult;
    /**
     * Parses the ascii encoded number of the PDF file
     * */
    static extractNumber(data: Uint8Array, start: number, end?: number): ExtractionResult;
    /**
     * Converts the given date into PDF formatting
     * */
    static convertDateToPDFDate(date: Date): string;
    /**
     * Converts a unicode sequence into a string
     * */
    static convertUnicodeToString(val: Uint8Array): string;
    static convertAsciiToString(val: number[] | Uint8Array): string;
    /**
     * takes a number and returns an array of its char representations
     * */
    static convertNumberToCharArray(nbr: number | string): number[];
    /**
     * Converts a hex string into a byte array
     * That means two consecutive hex values are merged into one byte that is appended to the array
     * */
    static convertHexStringToByteArray(hex_string: string | Uint8Array | number[]): number[];
    /**
     * Converts an array of byte values into a hex string
     * */
    static convertByteArrayToHexString(values: Uint8Array | number[]): string;
    /**
     * takes two arrays and checks their equality
     * */
    static areArraysEqual(array_one: Uint8Array | number[], array_two: Uint8Array | number[]): boolean;
    /**
     * Prints the array with leading indexes 10 bytes in a row
     * Delimiter are substituted by '.'
     * */
    static debug_printIndexed(array: Uint8Array | number[]): void;
    /**
     * Converts a list of 8 bit integers into a list of 32 bit integers
     * */
    static convertUint8ArrayToInt32Array(a: Uint8Array | number[]): Int32Array;
    /**
     * Converts a list of 32 bit integers into a list of 8 bit UNSIGNED integers
     * */
    static convertInt32ArrayToUint8Array(a: Int32Array | number[]): Uint8Array;
    /**
     * Adds escape symbols to specific elements of the provided string
     *
     * Symbols that needs to be escaped are: \ ) (
     * */
    static escapeString(array: Uint8Array | number[]): Uint8Array;
    /**
     * Removes escape symbols from the given string
     *
     * Symbols that needs to be escaped are: \ ) (
     * */
    static unescapeString(array: Uint8Array | number[]): Uint8Array;
    /**
     * Returns true, if the object corresponds to the interface of a reference pointer.
     * */
    static isReferencePointer(obj: any): boolean;
    /**
     * If color is provided in range [0,1) it will map these values in the color range [0, 255]
     * */
    static colorToRange255(color: Color): Color;
    /**
     * If color is provided in range [0,255] it will map these values in the color range [0, 1]
     * */
    static colorToRange01(color: Color): Color;
    /**
     * Returns the HTML color hex code of the provided color
     * */
    static colorToHex(color: Color): string;
    /**
     * Converts a string into a byte string / hex string <12AFA3>
     * */
    static convertStringToByteString(value: string): number[];
    /**
     * Converts a string into a byte string / hex string <12AFA3>
     * */
    static convertStringToHexString(value: string): number[];
}

import { ReferencePointer, PDFDocumentParser } from './parser';
export declare enum FontType {
    Type0 = 0,
    Type1 = 1,
    Type3 = 2,
    MMType1 = 3,
    TrueType = 4,
    CIDFontType0 = 5,
    CIDFontType2 = 6
}
export interface FontDescriptor {
    fontName: string;
    fontFamily?: string | undefined;
    fontStretch?: string | undefined;
    fontWeight?: string | undefined;
    flags: number | undefined;
    fontBBox?: number[] | undefined;
    italicAngle: number;
    ascent?: number | undefined;
    descent?: number | undefined;
    leading?: number | undefined;
    capHeight?: number | undefined;
    xHeight?: number | undefined;
    stemV?: number | undefined;
    stemH?: number | undefined;
    avgWidth?: number | undefined;
    maxWidth?: number | undefined;
    missingWidth?: number | undefined;
}
export declare class Font {
    object_id: ReferencePointer | undefined;
    /**
     * Determines if the font must be written to the PDF document, since it is not yet defined
     * */
    is_new: boolean;
    fontType: FontType | undefined;
    name: string | undefined;
    baseFont: string | undefined;
    firstChar: number | undefined;
    lastChar: number | undefined;
    widths: number[] | undefined;
    fontDescriptor: FontDescriptor | undefined;
    encoding: string | undefined;
    kernings: Map<number, number[][]> | undefined;
    constructor(fontType?: FontType | undefined, name?: string | undefined, baseFont?: string | undefined);
    /**
     * Calculates the dimensions of the text using this font
     *
     * It also proposes linebreak positions for the provided width
     * */
    proposeLinebreaks(text: string, fontSize: number, width: number): {
        start: number;
        end: number;
        width: number;
    }[];
    /**
     * Calculates the dimensions of the text using this font
     *
     * Returns [width, height]
     * */
    calculateTextDimensions(text: string, fontSize: number): number[];
    /**
     * Calculates the dimensions of the text using this font in mm
     *
     * Returns [width, height]
     * */
    calculateTextDimensionsInMM(text: string, fontSize: number): number[];
    /**
     * Helper method to lookup the kerning value
     * */
    private getKerningValue;
    /**
     * Returns the array of letter widths that are contained in the string
     * */
    getTextWidthArray(text: string, fontSize: number): number[];
    /**
     * Returns the widths array of a standard font
     * */
    private populateStandardFontData;
    /**
     * Returns a standard font
     * fontName the name reference the font name
     * baseFont the standard font
     * */
    static createStandardFont(object_id: ReferencePointer, fontName: string, baseFont: string): Font;
    /**
     * True, if the name is a standard font name
     * */
    static isStandardFont(name: string): boolean;
    private typeToNumberArray;
    writeFontDescriptor(): number[];
    writeFont(): number[];
}
export declare class FontManager {
    private parser;
    /**
     * The fonts in the document
     * */
    fonts: Font[];
    constructor(parser: PDFDocumentParser);
    /**
     * Returns the font with the corresponding reference pointer or name or basefont
     *
     * If there is no such font it returns undefined
     * */
    getFont(font: ReferencePointer | Font | string): Font | undefined;
    /**
     * Adds a font, if it does not already exists.
     * */
    addFont(font: Font | string): Font | undefined;
    /**
     * Returns a font name that is not used yet
     * */
    getUnusedFontName(): string;
    /**
     * Retutrns true, if the font is already part of the font manager
     *
     * Font can be a Font object, a reference pointer of a font object a font name or a base font
     * */
    hasFont(font_ptr: Font | ReferencePointer | string): boolean;
    /**
     * Returns true, if the font with the given name is registered, or if it is the name of a standard font.
     * */
    isRegisteredFont(font: string | Font): boolean;
    /**
     * Returns the new fonts that must be appended to the document
     * */
    getFontsToWrite(): Font[];
}

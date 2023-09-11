import { PDFVersion } from './util';
import { AnnotationFactory } from './annotation';
import { DocumentHistory, ObjectLookupTable, XRef } from './document-history';
import { CryptoEngine, CryptoConfiguration } from './crypto';
import { RawAnnotationObj } from './annotations/annotation_types';
import { TextAnnotationObj } from './annotations/text_annotation';
import { HighlightAnnotationObj } from './annotations/text_markup_annotation';
import { FreeTextAnnotationObj } from './annotations/freetext_annotation';
import { SquareAnnotationObj, CircleAnnotationObj } from './annotations/circle_square_annotation';
import { PolygonAnnotationObj, PolyLineAnnotationObj } from './annotations/polygon_polyline_annotation';
import { InkAnnotationObj } from './annotations/ink_annotation';
import { ContentStream } from './content-stream';
import { AppStream, XObject } from './appearance-stream';
import { Font, FontManager } from './fonts';
import { Resource } from './resources';
/**
 * Note that this parser does not parses the PDF file completely. It lookups those
 * parts that are important for the creation of annotations. For more information
 * please read the README.
 * */
/**
 * References in PDF documens are  of the form
 * <obj_id> <generation> R
 *
 * This holds such a reference
 * */
export interface ReferencePointer {
    obj: number;
    generation: number;
    reused?: boolean | undefined;
}
/**
 * Parses the content stream of an XObject.
 * */
export declare class ContentStreamParser {
    static TEXT_OBJECT_START: string;
    static TEXT_OBJECT_END: string;
    static MARKED_CONTENT_START: string;
    static MARKED_CONTENT_END: string;
    static extract(data: Uint8Array): ContentStream;
}
export declare class XObjectParser {
    static extract(data: Uint8Array, xref: XRef, objectLookupTable: ObjectLookupTable, cryptoInterface: CryptoInterface): XObject;
}
/**
 * Parses the appearance stream object. But if it is a reference it will not resolve the object and just provide
 * the reference.
 * */
export declare class AppearanceStreamParser {
    private static parseXObject;
    private static parseAppearanceStream;
    static parse(annot: Annotation, to_parse: any): AppStream;
}
/**
 * Parses a font object
 * */
export declare class FontParser {
    /**
     * Extract the font dictionary
     * */
    static extract(data: Uint8Array, xref: XRef, objectLookupTable: ObjectLookupTable, name: string): Font;
}
export declare type Annotation = RawAnnotationObj | TextAnnotationObj | HighlightAnnotationObj | FreeTextAnnotationObj | SquareAnnotationObj | CircleAnnotationObj | PolygonAnnotationObj | PolyLineAnnotationObj | InkAnnotationObj;
/**
 * Parses an annotation from the document and translates this into the pdfAnnotate datastructure
 * */
export declare class AnnotationParser {
    /**
     * Extract the annotation object it also assigns the raw data, i.e., potentially unknown/ additional attributes
     * */
    static extract(factory: AnnotationFactory, data: Uint8Array, xref: XRef, page: Page, objectLookupTable: ObjectLookupTable, cryptoInterface: CryptoInterface): Annotation;
}
/**
 * Represents the Catalog object of the PDF document
 * */
export declare class CatalogObject {
    private data;
    private xref;
    private objectLookupTable;
    /**
     * Extracts the data representing the object.
     * */
    constructor(data: Uint8Array, xref: XRef, objectLookupTable: ObjectLookupTable);
    private pagesObjectId;
    getPagesObjectId(): ReferencePointer;
}
/**
 * Represents the PageTree object of the PDF document
 * This is the object with /Type /Pages
 * */
export declare class PageTree {
    private data;
    private objectLookupTable;
    private pageCount;
    /**
     * References to page objects
     * */
    private pageReferences;
    /**
     * References to pages objects
     * */
    private visitedPages;
    constructor(data: Uint8Array, objectLookupTable: ObjectLookupTable);
    /**
     * Extracts the kids references recursively.
     * For every kid it checks if the referenced object type is:
     * - a /Pages object then it recursively lookups its children
     * - a /Page object then it adds the references
     * */
    extractPageReferences(references: ReferencePointer[]): void;
    /**
     * Extract the object data at the given pointer
     * */
    extract(xref: XRef, objectLookupTable: ObjectLookupTable): void;
    /**
     * Returns the number of pages the page tree comprises
     * */
    getPageCount(): number;
    /**
     * Returns the reference to the page objects
     * */
    getPageReferences(): ReferencePointer[];
    /**
     * Returns the references to the pages objects
     * */
    getPagesReferences(): ReferencePointer[];
}
/**
 * Represent a pages object in the PDF document
 * */
export declare class Pages {
    private data;
    private documentHistory;
    object_id: ReferencePointer | undefined;
    /**
     * Holds the resource dictionary that might be associated with the object
     * */
    resources: Resource | undefined;
    constructor(data: Uint8Array, documentHistory: DocumentHistory);
    /**
     * Extracts the page object starting at position ptr
     * */
    extract(xref: XRef, objectLookupTable: ObjectLookupTable): void;
}
/**
 * Represents a page object in the PDF document
 * */
export declare class Page {
    private data;
    private documentHistory;
    object_id: ReferencePointer | undefined;
    /**
     * Holds the resource dictionary that might be associated with the object
     * */
    resources: Resource | undefined;
    annots: ReferencePointer[];
    hasAnnotsField: boolean;
    annotsPointer: ReferencePointer | undefined;
    constructor(data: Uint8Array, documentHistory: DocumentHistory);
    /**
     * Extracts the references in the linked annotations array
     * */
    extractAnnotationArray(): void;
    /**
     * Extracts the page object starting at position ptr
     * */
    extract(xref: XRef, objectLookupTable: ObjectLookupTable): void;
}
/**
 * Provides a configured interface to handle the encryption and decryption of PDFs
 * */
export declare class CryptoInterface {
    private data?;
    private documentHistory?;
    private ref_ptr?;
    cryptoConfiguration: CryptoConfiguration;
    cryptoEngine: CryptoEngine;
    constructor(data?: Uint8Array | undefined, documentHistory?: DocumentHistory | undefined, ref_ptr?: XRef | undefined, user_pwd?: string, owner_pwd?: string);
    /**
     * Returns the reference pointer
     * */
    getEncryptionDictReference(): ReferencePointer | undefined;
    encrypt(data: Uint8Array, reference: ReferencePointer | undefined): Uint8Array;
    decrypt(data: Uint8Array, reference: ReferencePointer | undefined): Uint8Array;
    isUserPasswordCorrect(): boolean;
    isOwnerPasswordCorrect(): boolean;
    /**
     * Extracts the enrcyption dictionary
     * */
    extractEncryptionDictionary(ptr: XRef): void;
}
/**
 * Parses the relevant parts of the PDF document and provides functionality to extract the necessary information for
 * adding annotations
 * */
export declare class PDFDocumentParser {
    private data;
    private version;
    documentHistory: DocumentHistory;
    private catalogObject;
    private pageTree;
    private objectCache;
    private cryptoInterface;
    private fontManager;
    /**
     * Parses a PDF document and allows access to the cross reference table and individual PDF objects.
     *
     * Note that this class heavily relies on caching to prevent expensive lookup operations.
     * */
    constructor(data: Uint8Array, userpwd?: string, ownerpwd?: string);
    /**
     * Returns the crypto interface
     * */
    getCryptoInterface(): CryptoInterface;
    /**
     * Returns the major and minor version of the pdf document
     * */
    getPDFVersion(): PDFVersion;
    /**
     * Returns a free object id. It first checks wether there can be an freed object id reused. If that is not the case
     * it creates a new one
     * */
    getFreeObjectId(): ReferencePointer;
    /**
     * Returns the catalog object of the PDF file
     * */
    getCatalog(): CatalogObject;
    /**
     * Returns the latest version of the page tree object of the document
     * */
    getPageTree(): PageTree;
    /**
     * Returns the latest version of the page with the given pageNumber
     * */
    getPage(pageNumber: number | ReferencePointer): Page;
    /**
     * Returns the pages object with the given reference pointer
     * */
    getPages(refPtr: ReferencePointer): Pages;
    /**
     * Returns the annotations that exist in the document
     * */
    extractAnnotations(factory: AnnotationFactory): Annotation[][];
    /**
     * Extracts the fonts, hat are available in the document and setups the font manager
     * */
    extractFonts(): void;
    /**
     * Returns the font manager, that manages the available fonts in the document
     * */
    getFonts(): FontManager;
    /**
     * Extracts the XObject with the provided reference pointer
     * */
    extractXObject(p: ReferencePointer): XObject;
}

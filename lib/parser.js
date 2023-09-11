"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFDocumentParser = exports.CryptoInterface = exports.Page = exports.Pages = exports.PageTree = exports.CatalogObject = exports.AnnotationParser = exports.FontParser = exports.AppearanceStreamParser = exports.XObjectParser = exports.ContentStreamParser = void 0;
const util_1 = require("./util");
const object_util_1 = require("./object-util");
const document_history_1 = require("./document-history");
const crypto_1 = require("./crypto");
const annotation_types_1 = require("./annotations/annotation_types");
const text_annotation_1 = require("./annotations/text_annotation");
const text_markup_annotation_1 = require("./annotations/text_markup_annotation");
const freetext_annotation_1 = require("./annotations/freetext_annotation");
const circle_square_annotation_1 = require("./annotations/circle_square_annotation");
const polygon_polyline_annotation_1 = require("./annotations/polygon_polyline_annotation");
const ink_annotation_1 = require("./annotations/ink_annotation");
const content_stream_1 = require("./content-stream");
const appearance_stream_1 = require("./appearance-stream");
const fonts_1 = require("./fonts");
const resources_1 = require("./resources");
/**
 * Parses the content stream of an XObject.
 * */
class ContentStreamParser {
    static extract(data) {
        let ret_val = new content_stream_1.ContentStream();
        let grouping_object = [ret_val];
        let index = 0;
        let parameters = [];
        while (index < data.length) {
            let word = util_1.Util.readNextWord(data, index);
            let skipped_index = util_1.Util.skipSymbol(data, util_1.Util.SPACE, word.end_index + 1); // make it robust against traling spaces
            if ((data[skipped_index] === util_1.Util.LF || data[skipped_index] === util_1.Util.COMMENT_START[0]) && word.result !== "") {
                let op_name = util_1.Util.convertUnicodeToString(word.result);
                if (op_name === ContentStreamParser.TEXT_OBJECT_START) {
                    grouping_object.push([parameters]);
                }
                else if (op_name === ContentStreamParser.TEXT_OBJECT_END) {
                    let new_ops = grouping_object.pop();
                    let to = new content_stream_1.TextObject();
                    to.parameters = [...new_ops[0]];
                    to.operators = new_ops.slice(1);
                    if (Array.isArray(grouping_object[grouping_object.length - 1])) {
                        grouping_object[grouping_object.length - 1].push(to);
                    }
                    else {
                        grouping_object[grouping_object.length - 1].addOperator(to);
                    }
                }
                else if (op_name === ContentStreamParser.MARKED_CONTENT_START) {
                    grouping_object.push([parameters]);
                }
                else if (op_name === ContentStreamParser.MARKED_CONTENT_END) {
                    let new_ops = grouping_object.pop();
                    let to = new content_stream_1.MarkedContent();
                    to.parameters = [...new_ops[0]];
                    to.operators = new_ops.slice(1);
                    if (Array.isArray(grouping_object[grouping_object.length - 1])) {
                        grouping_object[grouping_object.length - 1].push(to);
                    }
                    else {
                        grouping_object[grouping_object.length - 1].addOperator(to);
                    }
                }
                else {
                    if (grouping_object[grouping_object.length - 1] instanceof content_stream_1.ContentStream) {
                        grouping_object[grouping_object.length - 1].addOperator(new content_stream_1.Operator(op_name, [...parameters]));
                    }
                    else {
                        grouping_object[grouping_object.length - 1].push(new content_stream_1.Operator(op_name, [...parameters]));
                    }
                }
                parameters = [];
                index = word.end_index + 1;
            }
            else {
                if (!word.result) {
                    index = word.end_index + 1;
                }
                else if (word.result[0] === util_1.Util.LITERAL_STRING_START[0]) {
                    let res = util_1.Util.extractString(data, word.start_index);
                    parameters.push(util_1.Util.convertUnicodeToString(res.result));
                    index = res.end_index + 1;
                }
                else if (word.result[0] === util_1.Util.HEX_STRING_START[0]) {
                    let res = util_1.Util.extractHexString(data, word.start_index);
                    parameters.push(res.result);
                    index = res.end_index + 1;
                }
                else if (word.result[0] === 47) {
                    let res = util_1.Util.extractOptionValue(data, word.start_index);
                    parameters.push("/" + res.result);
                    index = res.end_index + 1;
                }
                else if (word.result[0] === util_1.Util.R[0]) {
                    let ref_ptr = { obj: parameters[parameters.length - 2], generation: parameters[parameters.length - 1] };
                    parameters = parameters.slice(0, parameters.length - 2);
                    parameters.push(ref_ptr);
                    index = word.end_index + 1;
                }
                else { // number
                    let res = util_1.Util.extractNumber(data, word.start_index);
                    parameters.push(res.result);
                    index = res.end_index + 1;
                }
            }
        }
        return ret_val;
    }
}
exports.ContentStreamParser = ContentStreamParser;
ContentStreamParser.TEXT_OBJECT_START = "BT";
ContentStreamParser.TEXT_OBJECT_END = "ET";
ContentStreamParser.MARKED_CONTENT_START = "BMC";
ContentStreamParser.MARKED_CONTENT_END = "EMC";
class XObjectParser {
    static extract(data, xref, objectLookupTable, cryptoInterface) {
        let res = object_util_1.ObjectUtil.extractObject(data, xref, objectLookupTable);
        if (res.value["/Type"] !== "/XObject" || res.value["/Subtype"] !== "/Form") {
            throw Error(`Xref {xref} is no valid XObject`);
        }
        let ret_obj = new appearance_stream_1.XObjectObj();
        if (res.value["/Name"])
            ret_obj.name = res.value["/Name"];
        if (res.value["/Matrix"])
            ret_obj.matrix = res.value["/Matrix"];
        if (res.value["/FormType"])
            ret_obj.formType = res.value["/FormType"];
        if (res.value["/BBox"])
            ret_obj.bBox = res.value["/BBox"];
        if (res.value["/Resources"])
            ret_obj.resources = res.value["/Resources"];
        // parse content stream
        if (res.stream && res.stream.data && res.stream.data.length > 0) {
            ret_obj.contentStream = ContentStreamParser.extract(res.stream.data);
        }
        return ret_obj;
    }
}
exports.XObjectParser = XObjectParser;
/**
 * Parses the appearance stream object. But if it is a reference it will not resolve the object and just provide
 * the reference.
 * */
class AppearanceStreamParser {
    static parseXObject(to_parse) {
        return new appearance_stream_1.XObjectObj();
    }
    static parseAppearanceStream(key, to_parse) {
        if (util_1.Util.isReferencePointer(to_parse[key])) {
            return to_parse[key];
        }
        else if (to_parse[key]["/Off"] && to_parse[key]["/ON"]) {
            if (util_1.Util.isReferencePointer(to_parse[key]["/Off"])) {
                return to_parse[key]["/Off"];
            }
            else {
                return AppearanceStreamParser.parseXObject(to_parse[key]["/Off"]);
            }
            if (util_1.Util.isReferencePointer(to_parse[key]["/On"])) {
                return to_parse[key]["/On"];
            }
            else {
                return AppearanceStreamParser.parseXObject(to_parse[key]["/On"]);
            }
        }
        else {
            return AppearanceStreamParser.parseXObject(to_parse[key]);
        }
    }
    static parse(annot, to_parse) {
        if (!to_parse["/N"]) {
            throw Error("/N flag is required in appearance stream");
        }
        let appStream = new appearance_stream_1.AppStream(annot);
        appStream.N = AppearanceStreamParser.parseAppearanceStream("/N", to_parse);
        if (to_parse["/R"]) {
            appStream.R = AppearanceStreamParser.parseAppearanceStream("/R", to_parse);
        }
        if (to_parse["/D"]) {
            appStream.D = AppearanceStreamParser.parseAppearanceStream("/D", to_parse);
        }
        return appStream;
    }
}
exports.AppearanceStreamParser = AppearanceStreamParser;
/**
 * Parses a font object
 * */
class FontParser {
    /**
     * Extract the font dictionary
     * */
    static extract(data, xref, objectLookupTable, name) {
        let res = object_util_1.ObjectUtil.extractObject(data, xref, objectLookupTable);
        let ftype = fonts_1.FontType.Type1;
        switch (res.value["/Subtype"]) {
            case "/Type0":
                ftype = fonts_1.FontType.Type0;
                break;
            case "/Type1":
                ftype = fonts_1.FontType.Type1;
                break;
            case "/Type3":
                ftype = fonts_1.FontType.Type3;
                break;
            case "/MMType1":
                ftype = fonts_1.FontType.MMType1;
                break;
            case "/TrueType":
                ftype = fonts_1.FontType.TrueType;
                break;
            case "/CIDFontType0":
                ftype = fonts_1.FontType.CIDFontType0;
                break;
            case "/CIDFontType2":
                ftype = fonts_1.FontType.CIDFontType2;
                break;
            default:
                ftype = undefined;
        }
        let font = new fonts_1.Font(ftype, name, res.value["/BaseFont"]);
        return font;
    }
}
exports.FontParser = FontParser;
/**
 * Parses an annotation from the document and translates this into the pdfAnnotate datastructure
 * */
class AnnotationParser {
    /**
     * Extract the annotation object it also assigns the raw data, i.e., potentially unknown/ additional attributes
     * */
    static extract(factory, data, xref, page, objectLookupTable, cryptoInterface) {
        let annot_obj = object_util_1.ObjectUtil.extractObject(data, xref, objectLookupTable);
        annot_obj = annot_obj.value;
        let ret_obj;
        switch (annot_obj["/Subtype"]) {
            case "/Circle":
                ret_obj = new circle_square_annotation_1.CircleAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/Square":
                ret_obj = new circle_square_annotation_1.SquareAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/FreeText":
                ret_obj = new freetext_annotation_1.FreeTextAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/Ink":
                ret_obj = new ink_annotation_1.InkAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/PolyLine":
                ret_obj = new polygon_polyline_annotation_1.PolyLineAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/Polygon":
                ret_obj = new polygon_polyline_annotation_1.PolygonAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/Text":
                ret_obj = new text_annotation_1.TextAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/Highlight":
                ret_obj = new text_markup_annotation_1.HighlightAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/Underline":
                ret_obj = new text_markup_annotation_1.UnderlineAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/Squiggly":
                ret_obj = new text_markup_annotation_1.SquigglyAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            case "/StrikeOut":
                ret_obj = new text_markup_annotation_1.StrikeOutAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
                break;
            default:
                ret_obj = new annotation_types_1.RawAnnotationObj();
                ret_obj.object_id = { obj: xref.id, generation: xref.generation };
                ret_obj.extract(annot_obj, page, cryptoInterface);
        }
        ret_obj.factory = factory;
        return ret_obj;
    }
}
exports.AnnotationParser = AnnotationParser;
/**
 * Represents the Catalog object of the PDF document
 * */
class CatalogObject {
    /**
     * Extracts the data representing the object.
     * */
    constructor(data, xref, objectLookupTable) {
        this.data = data;
        this.xref = xref;
        this.objectLookupTable = objectLookupTable;
        this.pagesObjectId = { obj: -1, generation: -1 };
        this.data = data;
        let page_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable).value;
        if (page_obj["/Type"] !== "/Catalog")
            throw Error(`Invalid catalog object at position ${xref.pointer}`);
        this.pagesObjectId = page_obj["/Pages"];
    }
    getPagesObjectId() {
        return this.pagesObjectId;
    }
}
exports.CatalogObject = CatalogObject;
/**
 * Represents the PageTree object of the PDF document
 * This is the object with /Type /Pages
 * */
class PageTree {
    constructor(data, objectLookupTable) {
        this.data = data;
        this.objectLookupTable = objectLookupTable;
        this.pageCount = -1;
        /**
         * References to page objects
         * */
        this.pageReferences = [];
        /**
         * References to pages objects
         * */
        this.visitedPages = [];
        this.data = data;
    }
    /**
     * Extracts the kids references recursively.
     * For every kid it checks if the referenced object type is:
     * - a /Pages object then it recursively lookups its children
     * - a /Page object then it adds the references
     * */
    extractPageReferences(references) {
        for (let reference of references) {
            if (this.visitedPages.some(el => el.obj === reference.obj &&
                el.generation === reference.generation)) {
                continue;
            }
            let xref = this.objectLookupTable[reference.obj];
            let kid_page_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, this.objectLookupTable).value;
            if (kid_page_obj["/Type"] === "/Page") {
                this.pageReferences.push(reference);
            }
            else if (kid_page_obj["/Type"] === "/Pages") {
                this.visitedPages.push(reference);
                this.extractPageReferences(kid_page_obj["/Kids"]);
            }
            else {
                throw Error(`Invalid object type ${kid_page_obj["/Type"]}`);
            }
        }
    }
    /**
     * Extract the object data at the given pointer
     * */
    extract(xref, objectLookupTable) {
        let page_tree_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable).value;
        if (!page_tree_obj["/Kids"])
            throw Error(`Could not find index of /Kids in /Pages object`);
        let refs = page_tree_obj["/Kids"];
        this.pageReferences = [];
        this.extractPageReferences(refs);
        this.pageCount = this.pageReferences.length;
    }
    /**
     * Returns the number of pages the page tree comprises
     * */
    getPageCount() {
        return this.pageCount;
    }
    /**
     * Returns the reference to the page objects
     * */
    getPageReferences() {
        return this.pageReferences;
    }
    /**
     * Returns the references to the pages objects
     * */
    getPagesReferences() {
        return this.visitedPages;
    }
}
exports.PageTree = PageTree;
/**
 * Represent a pages object in the PDF document
 * */
class Pages {
    constructor(data, documentHistory) {
        this.data = data;
        this.documentHistory = documentHistory;
        /**
         * Holds the resource dictionary that might be associated with the object
         * */
        this.resources = undefined;
        this.data = data;
    }
    /**
     * Extracts the page object starting at position ptr
     * */
    extract(xref, objectLookupTable) {
        let page_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable);
        this.object_id = page_obj.id;
        let resources = page_obj.value["/Resources"];
        if (resources) {
            this.resources = new resources_1.Resource();
            this.resources.associatedWith = this.object_id;
            this.resources.extract(resources);
        }
    }
}
exports.Pages = Pages;
/**
 * Represents a page object in the PDF document
 * */
class Page {
    constructor(data, documentHistory) {
        this.data = data;
        this.documentHistory = documentHistory;
        /**
         * Holds the resource dictionary that might be associated with the object
         * */
        this.resources = undefined;
        this.annots = [];
        this.hasAnnotsField = false;
        this.data = data;
    }
    /**
     * Extracts the references in the linked annotations array
     * */
    extractAnnotationArray() {
        let obj_table = this.documentHistory.createObjectLookupTable();
        if (!this.annotsPointer)
            throw Error("Annotations pointer not set");
        let ref_annot_table = obj_table[this.annotsPointer.obj];
        let annotations_obj = object_util_1.ObjectUtil.extractObject(this.data, ref_annot_table, obj_table);
        this.annots = annotations_obj.value;
    }
    /**
     * Extracts the page object starting at position ptr
     * */
    extract(xref, objectLookupTable) {
        let page_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable);
        this.object_id = page_obj.id;
        let annots = page_obj.value["/Annots"];
        if (annots) {
            this.hasAnnotsField = true;
            if (Array.isArray(annots)) {
                this.annots = annots.filter((x) => x !== 'null');
            }
            else {
                this.annotsPointer = annots;
                this.extractAnnotationArray();
            }
        }
        let resources = page_obj.value["/Resources"];
        if (resources) {
            this.resources = new resources_1.Resource();
            this.resources.associatedWith = this.object_id;
            this.resources.extract(resources);
        }
    }
}
exports.Page = Page;
/**
 * Provides a configured interface to handle the encryption and decryption of PDFs
 * */
class CryptoInterface {
    constructor(data, documentHistory, ref_ptr, user_pwd, owner_pwd) {
        this.data = data;
        this.documentHistory = documentHistory;
        this.ref_ptr = ref_ptr;
        this.cryptoConfiguration = { version: undefined, revision: undefined, filter: undefined, user_pwd: "", owner_pwd: "", length: undefined, permissions: undefined, owner_pwd_c: undefined, user_pwd_c: undefined };
        this.cryptoEngine = new crypto_1.IdentityEngine();
        this.data = data;
        this.documentHistory = documentHistory;
        this.cryptoConfiguration.user_pwd = user_pwd ? user_pwd : "";
        this.cryptoConfiguration.owner_pwd = owner_pwd ? owner_pwd : "";
        if (this.ref_ptr && this.documentHistory) {
            this.extractEncryptionDictionary(this.ref_ptr);
            // setup crypto-engine
            if (this.cryptoConfiguration.version === 1) {
                this.cryptoEngine = new crypto_1.RC4CryptoEngine(this.cryptoConfiguration, this.documentHistory.getRecentUpdate().id, crypto_1.RC4_40_BIT);
            }
            else if (this.cryptoConfiguration.version === 2) {
                this.cryptoEngine = new crypto_1.RC4CryptoEngine(this.cryptoConfiguration, this.documentHistory.getRecentUpdate().id);
            }
            else if (this.cryptoConfiguration.version === 4) {
                console.log("Some fancy AES encryption");
            }
            else {
                throw Error(`Unsupported Encryption ${this.cryptoConfiguration.version}`);
            }
        }
    }
    /**
     * Returns the reference pointer
     * */
    getEncryptionDictReference() {
        if (!this.ref_ptr)
            return undefined;
        return { obj: this.ref_ptr.id, generation: this.ref_ptr.generation };
    }
    encrypt(data, reference) {
        return this.cryptoEngine.encrypt(data, reference);
    }
    decrypt(data, reference) {
        return this.cryptoEngine.decrypt(data, reference);
    }
    isUserPasswordCorrect() {
        if (!this.cryptoEngine) {
            throw Error("Crypto engine not configured");
        }
        return this.cryptoEngine.isUserPasswordCorrect();
    }
    isOwnerPasswordCorrect() {
        if (!this.cryptoEngine) {
            throw Error("Crypto engine not configured");
        }
        return this.cryptoEngine.isOwnerPasswordCorrect();
    }
    /**
     * Extracts the enrcyption dictionary
     * */
    extractEncryptionDictionary(ptr) {
        if (!this.documentHistory) {
            throw Error("Documenthistory not configured");
        }
        if (!this.data) {
            throw Error("Data not configured");
        }
        let obj_table = this.documentHistory.createObjectLookupTable();
        let page_obj = object_util_1.ObjectUtil.extractObject(this.data, ptr, obj_table);
        this.cryptoConfiguration.version = page_obj.value["/V"];
        this.cryptoConfiguration.revision = page_obj.value["/R"];
        this.cryptoConfiguration.filter = page_obj.value["/Filter"];
        this.cryptoConfiguration.user_pwd_c = page_obj.value["/U"];
        this.cryptoConfiguration.owner_pwd_c = page_obj.value["/O"];
        this.cryptoConfiguration.length = page_obj.value["/Length"];
        this.cryptoConfiguration.permissions = page_obj.value["/P"];
    }
}
exports.CryptoInterface = CryptoInterface;
class ObjectCache {
    constructor() {
        this.cache = {};
    }
    set(key, value) {
        this.cache[`${key.obj}_${key.generation}`] = value;
    }
    get(key, otherwise = undefined) {
        return this.cache[`${key.obj}_${key.generation}`] || otherwise;
    }
    has(key) {
        return typeof this.cache[`${key.obj}_${key.generation}`] !== 'undefined';
    }
}
/**
 * Parses the relevant parts of the PDF document and provides functionality to extract the necessary information for
 * adding annotations
 * */
class PDFDocumentParser {
    /**
     * Parses a PDF document and allows access to the cross reference table and individual PDF objects.
     *
     * Note that this class heavily relies on caching to prevent expensive lookup operations.
     * */
    constructor(data, userpwd = "", ownerpwd = "") {
        this.data = data;
        this.version = undefined;
        this.documentHistory = new document_history_1.DocumentHistory(new Uint8Array([]));
        this.catalogObject = undefined;
        this.pageTree = undefined;
        this.objectCache = new ObjectCache();
        this.cryptoInterface = new CryptoInterface();
        this.fontManager = undefined;
        this.data = new Uint8Array(data);
        this.documentHistory = new document_history_1.DocumentHistory(this.data);
        this.documentHistory.extractDocumentHistory();
        if (this.documentHistory.isEncrypted()) {
            // extract encryption dictionary
            let obj_table = this.documentHistory.createObjectLookupTable();
            let enc_obj = this.documentHistory.getRecentUpdate().encrypt;
            if (!enc_obj)
                throw Error("Invalid encryption indication");
            let enc_obj_ptr = obj_table[enc_obj.obj];
            this.cryptoInterface = new CryptoInterface(this.data, this.documentHistory, enc_obj_ptr, userpwd, ownerpwd);
            // verify keys
            if (!this.cryptoInterface.isUserPasswordCorrect()) {
                if (!this.cryptoInterface.isOwnerPasswordCorrect()) {
                    throw Error("No valid user credentials");
                }
            }
        }
    }
    /**
     * Returns the crypto interface
     * */
    getCryptoInterface() {
        return this.cryptoInterface;
    }
    /**
     * Returns the major and minor version of the pdf document
     * */
    getPDFVersion() {
        if (this.version)
            return this.version;
        this.version = util_1.Util.extractVersion(this.data, 0);
        return this.version;
    }
    /**
     * Returns a free object id. It first checks wether there can be an freed object id reused. If that is not the case
     * it creates a new one
     * */
    getFreeObjectId() {
        return this.documentHistory.getFreeObjectId();
    }
    /**
     * Returns the catalog object of the PDF file
     * */
    getCatalog() {
        let recent_update = this.documentHistory.getRecentUpdate();
        if (recent_update.root) {
            let root_obj = recent_update.root;
            let obj_table = this.documentHistory.createObjectLookupTable();
            return new CatalogObject(this.data, obj_table[root_obj.obj], obj_table);
        }
        else { // If we do not know the catalogue object we need to look it up
            // In cross reference stream objects no /ROOT field is required, however often it is provided anyway
            // otherwise run this routine, but buffer the catalog object
            if (this.catalogObject)
                return this.catalogObject;
            throw Error("Does not work for compressed data");
        }
    }
    /**
     * Returns the latest version of the page tree object of the document
     * */
    getPageTree() {
        if (this.pageTree)
            return this.pageTree;
        let obj_table = this.documentHistory.createObjectLookupTable();
        let catalog_object = this.getCatalog();
        let pages_id = catalog_object.getPagesObjectId();
        let pages_ref = obj_table[pages_id.obj];
        let pageTree = new PageTree(this.data, obj_table);
        pageTree.extract(pages_ref, obj_table);
        this.pageTree = pageTree;
        return pageTree;
    }
    /**
     * Returns the latest version of the page with the given pageNumber
     * */
    getPage(pageNumber) {
        let pageId = undefined;
        if (typeof pageNumber === 'number') {
            let pageTree = this.getPageTree();
            pageId = pageTree.getPageReferences()[pageNumber];
        }
        else if (util_1.Util.isReferencePointer(pageNumber)) {
            pageId = pageNumber;
        }
        if (!pageId)
            throw Error("Could not determine reference pointer from page number");
        if (this.objectCache.has(pageId)) {
            let cached = this.objectCache.get(pageId);
            if (!(cached instanceof Page))
                throw Error("Invalid cached Page object");
            return cached;
        }
        let obj_table = this.documentHistory.createObjectLookupTable();
        let obj_ptr = obj_table[pageId.obj];
        let page = new Page(this.data, this.documentHistory);
        page.extract(obj_ptr, obj_table);
        this.objectCache.set(pageId, page);
        return page;
    }
    /**
     * Returns the pages object with the given reference pointer
     * */
    getPages(refPtr) {
        if (this.objectCache.has(refPtr)) {
            let cached = this.objectCache.get(refPtr);
            if (!(cached instanceof Pages))
                throw Error("Invalid cached Pages object");
            return cached;
        }
        let obj_table = this.documentHistory.createObjectLookupTable();
        let obj_ptr = obj_table[refPtr.obj];
        let page = new Pages(this.data, this.documentHistory);
        page.extract(obj_ptr, obj_table);
        this.objectCache.set(refPtr, page);
        return page;
    }
    /**
     * Returns the annotations that exist in the document
     * */
    extractAnnotations(factory) {
        let annots = [];
        let pt = this.getPageTree();
        let obj_table = this.documentHistory.createObjectLookupTable();
        let pageCount = pt.getPageCount();
        for (let i = 0; i < pageCount; ++i) {
            let page = this.getPage(i);
            let annotationReferences = page.annots;
            let pageAnnots = [];
            for (let refPtr of annotationReferences) {
                let a = AnnotationParser.extract(factory, this.data, obj_table[refPtr.obj], page, obj_table, this.cryptoInterface);
                a.page = i;
                pageAnnots.push(a);
            }
            annots.push(pageAnnots);
        }
        return annots;
    }
    /**
     * Extracts the fonts, hat are available in the document and setups the font manager
     * */
    extractFonts() {
        var _a, _b;
        let pageTree = this.getPageTree();
        let pageReferences = pageTree.getPageReferences();
        let obj_table = this.documentHistory.createObjectLookupTable();
        if (!this.fontManager) {
            throw Error("FontManager not set");
        }
        for (let reference of pageReferences) {
            let page = this.getPage(reference);
            if (page.resources) {
                for (let resDef of page.resources.font) {
                    if (!resDef.refPtr) {
                        throw Error("Reference pointer not set in resource definition");
                    }
                    if (!this.fontManager.hasFont(resDef.refPtr) && ((_a = resDef.refPtr) === null || _a === void 0 ? void 0 : _a.obj)) {
                        let font = FontParser.extract(this.data, obj_table[resDef.refPtr.obj], obj_table, resDef.name);
                        font.object_id = resDef.refPtr;
                        this.fontManager.addFont(font);
                    }
                }
            }
        }
        let pagesReferences = pageTree.getPagesReferences();
        for (let reference of pagesReferences) {
            let pages = this.getPages(reference);
            if (pages.resources) {
                for (let resDef of pages.resources.font) {
                    if (!resDef.refPtr) {
                        throw Error("Reference pointer not set in resource definition");
                    }
                    if (!this.fontManager.hasFont(resDef.refPtr) && ((_b = resDef.refPtr) === null || _b === void 0 ? void 0 : _b.obj)) {
                        let font = FontParser.extract(this.data, obj_table[resDef.refPtr.obj], obj_table, resDef.name);
                        font.object_id = resDef.refPtr;
                        this.fontManager.addFont(font);
                    }
                }
            }
        }
    }
    /**
     * Returns the font manager, that manages the available fonts in the document
     * */
    getFonts() {
        if (this.fontManager)
            return this.fontManager;
        this.fontManager = new fonts_1.FontManager(this);
        this.extractFonts();
        return this.fontManager;
    }
    /**
     * Extracts the XObject with the provided reference pointer
     * */
    extractXObject(p) {
        let obj_table = this.documentHistory.createObjectLookupTable();
        return XObjectParser.extract(this.data, obj_table[p.obj], obj_table, this.cryptoInterface);
    }
}
exports.PDFDocumentParser = PDFDocumentParser;
//# sourceMappingURL=parser.js.map
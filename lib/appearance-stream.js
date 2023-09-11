"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphicsStateParameter = exports.XObjectObj = exports.AppStream = void 0;
const writer_util_1 = require("./writer-util");
const util_1 = require("./util");
const content_stream_1 = require("./content-stream");
const stream_1 = require("./stream");
class AppStream {
    constructor(annot) {
        this.object_id = undefined;
        this.new_object = false; // indicates to the factory that this object must be created when writing the document
        this.N = undefined;
        this.R = undefined;
        this.D = undefined;
        this.annot = annot;
    }
    /**
     * Lookups the N content stream. If it is only provided by a reference pointer it will parse
     * the corresponding Xobject
     * */
    lookupNContentStream() {
        if (!this.N) {
            console.warn("call lookupNContentStream without set content stream value");
            return;
        }
        else if (util_1.Util.isReferencePointer(this.N)) {
            this.N = this.annot.factory.parser.extractXObject(this.N);
        }
        else if (this.N instanceof XObjectObj) {
            return; // already looked up
        }
        else {
            throw Error("Could not lookup N content stream");
        }
    }
    /**
     * Helper writer function of the references. Resolves different types
     * */
    writeAppearanceStreamObj(ap) {
        let ret = [];
        if (util_1.Util.isReferencePointer(ap)) {
            ret = ret.concat(writer_util_1.WriterUtil.writeReferencePointer(ap, true));
        }
        else if (ap instanceof XObjectObj) {
            if (!ap.object_id) {
                throw Error("No object id specified in XObject");
            }
            ret = ret.concat(writer_util_1.WriterUtil.writeReferencePointer(ap.object_id, true));
        }
        else {
            throw Error("Invalid appearance stream object");
        }
        return ret;
    }
    /**
     * Writes the appearance stream object
     * */
    writeAppearanceStream() {
        let ret = [];
        ret = ret.concat(writer_util_1.WriterUtil.DICT_START);
        if (this.N) {
            ret = ret.concat(writer_util_1.WriterUtil.AP_N);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.writeAppearanceStreamObj(this.N));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.R) {
            ret = ret.concat(writer_util_1.WriterUtil.AP_R);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.writeAppearanceStreamObj(this.R));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.D) {
            ret = ret.concat(writer_util_1.WriterUtil.AP_D);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.writeAppearanceStreamObj(this.D));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        ret = ret.concat(writer_util_1.WriterUtil.DICT_END);
        return ret;
    }
}
exports.AppStream = AppStream;
class XObjectObj {
    // note that Type is /XObject instead of /Annot in annotation objects
    constructor() {
        this.object_id = undefined;
        this.new_object = false; // indicates to the factory that this object must be created when writing the document
        this.type = "/Form";
        this.type_encoded = writer_util_1.WriterUtil.SUBTYPE; // = '/Form'
        this.bBox = [];
        this.name = "/ARM";
        this.matrix = [1, 0, 0, 1, 0, 0];
        this.formType = 1;
        this.contentStream = undefined;
        this.resources = undefined;
    }
    /**
     * Adds a content stream operator
     * */
    addOperator(operator, parameters = []) {
        if (!this.contentStream)
            this.contentStream = new content_stream_1.ContentStream();
        this.contentStream.addOperator(operator, parameters);
    }
    writeXObject(cryptoInterface) {
        if (!this.object_id)
            throw Error("object_id of XObject not set");
        let ret = [];
        ret = ret.concat(writer_util_1.WriterUtil.TYPE_XOBJECT);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.SUBTYPE);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.FORM);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.FORMTYPE);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(util_1.Util.convertNumberToCharArray(this.formType));
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.BBOX);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.bBox));
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.NAME);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(util_1.Util.convertStringToAscii(this.name));
        ret.push(writer_util_1.WriterUtil.SPACE);
        if (this.resources) {
            ret = ret.concat(writer_util_1.WriterUtil.RESOURCES);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.resources.writeResource());
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        ret = ret.concat(writer_util_1.WriterUtil.MATRIX);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.matrix));
        ret.push(writer_util_1.WriterUtil.SPACE);
        let stream_data = (this.contentStream) ? this.contentStream.writeContentStream() : [];
        return writer_util_1.WriterUtil.writeStreamObject(this.object_id, ret, new stream_1.FlateStream(new Uint8Array(stream_data), undefined, true, cryptoInterface, this.object_id));
    }
}
exports.XObjectObj = XObjectObj;
class GraphicsStateParameter {
    constructor(object_id = undefined) {
        this.object_id = undefined;
        this.new_object = false; // indicates to the factory that this object must be created when writing the document
        this.type = "/ExtGState";
        this.type_encoded = writer_util_1.WriterUtil.EXTGSTATE; // = '/ExtGState'
        this.CA = undefined;
        this.ca = undefined;
        this.object_id = object_id;
    }
    writeGStateParameter() {
        if (!this.object_id)
            throw Error("GStateParameter dictionary has no object id");
        let ret = writer_util_1.WriterUtil.writeReferencePointer(this.object_id);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.OBJ);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.DICT_START);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.TYPE_EXTGSTATE);
        ret.push(writer_util_1.WriterUtil.SPACE);
        // opacity stroking operations
        if (this.CA) {
            ret = ret.concat(writer_util_1.WriterUtil.OPACITY);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.CA));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        // opacity non stroking operations
        if (this.ca) {
            ret = ret.concat(writer_util_1.WriterUtil._OPACITY);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(this.ca));
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
exports.GraphicsStateParameter = GraphicsStateParameter;
//# sourceMappingURL=appearance-stream.js.map
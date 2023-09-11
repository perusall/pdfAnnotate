"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const writer_util_1 = require("./writer-util");
const util_1 = require("./util");
class Resource {
    constructor() {
        this.object_id = undefined;
        this.new_object = false; // indicates to the factory that this object must be created when writing the document
        /**
         * Hoelds the reference pointer of the object to which the resource dictionary is related
         * */
        this.associatedWith = undefined;
        this.extGState = [];
        this.colorSpace = [];
        this.pattern = [];
        this.shading = [];
        this.xObject = [];
        this.font = [];
        this.procSet = [];
        this.properties = [];
    }
    containsResourceDef(def, list) {
        return list.filter(d => d.name === def.name && def.refPtr && d.refPtr && def.refPtr.obj === d.refPtr.obj && def.refPtr.generation === d.refPtr.generation).length > 0;
    }
    addGStateDef(def) {
        if (!this.containsResourceDef(def, this.extGState)) {
            this.extGState.push(def);
        }
    }
    addColorSpaceDef(def) {
        if (!this.containsResourceDef(def, this.colorSpace)) {
            this.colorSpace.push(def);
        }
    }
    addPatternDef(def) {
        if (!this.containsResourceDef(def, this.pattern)) {
            this.pattern.push(def);
        }
    }
    addShadingDef(def) {
        if (!this.containsResourceDef(def, this.shading)) {
            this.shading.push(def);
        }
    }
    addXObjectDef(def) {
        if (!this.containsResourceDef(def, this.xObject)) {
            this.xObject.push(def);
        }
    }
    addFontDef(def) {
        if (!this.containsResourceDef(def, this.font)) {
            this.font.push(def);
        }
    }
    addProcSetDef(def) {
        if (!this.containsResourceDef(def, this.procSet)) {
            this.procSet.push(def);
        }
    }
    addProperty(def) {
        if (!this.containsResourceDef(def, this.properties)) {
            this.properties.push(def);
        }
    }
    writeDictAttribute(defs) {
        let ret_val = [];
        ret_val = ret_val.concat(writer_util_1.WriterUtil.DICT_START);
        ret_val.push(writer_util_1.WriterUtil.SPACE);
        for (let def of defs) {
            def.name = def.name.trim();
            if (def.name.charAt(0) !== "/")
                def.name = `/${def.name}`;
            ret_val = ret_val.concat(util_1.Util.convertStringToAscii(def.name));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            if (!def.refPtr)
                throw Error("Missing reference pointer in resource definition");
            ret_val = ret_val.concat(writer_util_1.WriterUtil.writeReferencePointer(def.refPtr, true));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        ret_val = ret_val.concat(writer_util_1.WriterUtil.DICT_END);
        return ret_val;
    }
    writeArrayAttribute(defs) {
        let ret_val = [];
        ret_val = ret_val.concat(writer_util_1.WriterUtil.ARRAY_START);
        for (let def of defs) {
            def.name = def.name.trim();
            if (def.name.charAt(0) !== "/")
                def.name = `/${def.name}`;
            ret_val = ret_val.concat(util_1.Util.convertStringToAscii(def.name));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        ret_val = ret_val.concat(writer_util_1.WriterUtil.ARRAY_END);
        return ret_val;
    }
    writeResource() {
        let ret_val = [];
        ret_val = ret_val.concat(writer_util_1.WriterUtil.DICT_START);
        ret_val.push(writer_util_1.WriterUtil.SPACE);
        if (this.extGState.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.EXTGSTATE);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeDictAttribute(this.extGState));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.colorSpace.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.COLORSPACE);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeDictAttribute(this.colorSpace));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.pattern.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.PATTERN);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeDictAttribute(this.pattern));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.shading.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.SHADING);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeDictAttribute(this.shading));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.xObject.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.XOBJECT);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeDictAttribute(this.xObject));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.font.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.FONT);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeDictAttribute(this.font));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.procSet.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.PROCSET);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeArrayAttribute(this.procSet));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.properties.length > 0) {
            ret_val = ret_val.concat(writer_util_1.WriterUtil.PROPERTIES);
            ret_val.push(writer_util_1.WriterUtil.SPACE);
            ret_val = ret_val.concat(this.writeDictAttribute(this.properties));
            ret_val.push(writer_util_1.WriterUtil.SPACE);
        }
        ret_val = ret_val.concat(writer_util_1.WriterUtil.DICT_END);
        return ret_val;
    }
    /**
     * Extract the resource mappings from a dictionary
     * */
    extract(value) {
        if (value["/ExtGState"]) {
            for (let key of Object.keys(value["/ExtGState"])) {
                this.addGStateDef({ name: key, refPtr: value["/ExtGState"][key] });
            }
        }
        if (value["/ColorSpace"]) {
            for (let key of Object.keys(value["/ColorSpace"])) {
                this.addColorSpaceDef({ name: key, refPtr: value["/ColorSpace"][key] });
            }
        }
        if (value["/Pattern"]) {
            for (let key of Object.keys(value["/Pattern"])) {
                this.addPatternDef({ name: key, refPtr: value["/Pattern"][key] });
            }
        }
        if (value["/Shading"]) {
            for (let key of Object.keys(value["/Shading"])) {
                this.addShadingDef({ name: key, refPtr: value["/Shading"][key] });
            }
        }
        if (value["/XObject"]) {
            for (let key of Object.keys(value["/XObject"])) {
                this.addXObjectDef({ name: key, refPtr: value["/XObject"][key] });
            }
        }
        if (value["/Font"]) {
            for (let key of Object.keys(value["/Font"])) {
                this.addFontDef({ name: key, refPtr: value["/Font"][key] });
            }
        }
        if (value["/ProcSet"]) {
            for (let key of Object.keys(value["/ProcSet"])) {
                this.addProcSetDef({ name: key, refPtr: value["/ProcSet"][key] });
            }
        }
        if (value["/Properties"]) {
            for (let key of Object.keys(value["/Properties"])) {
                this.addProperty({ name: key, refPtr: value["/Properties"][key] });
            }
        }
    }
}
exports.Resource = Resource;
//# sourceMappingURL=resources.js.map
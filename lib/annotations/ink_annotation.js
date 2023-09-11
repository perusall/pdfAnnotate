"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InkAnnotationObj = void 0;
const annotation_types_1 = require("./annotation_types");
const annotation_errors_1 = require("./annotation_errors");
const writer_util_1 = require("../writer-util");
const appearance_stream_1 = require("../appearance-stream");
const resources_1 = require("../resources");
const content_stream_1 = require("../content-stream");
class InkAnnotationObj extends annotation_types_1.MarkupAnnotationObj {
    constructor() {
        super();
        this.inkList = [];
        this.type = "/Ink";
        this.type_encoded = [47, 73, 110, 107]; // = '/Ink'
    }
    writeAnnotationObject(cryptoInterface) {
        let ret = super.writeAnnotationObject(cryptoInterface);
        if (this.inkList && this.inkList.length > 0) {
            ret = ret.concat(writer_util_1.WriterUtil.INKLIST);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.writeNestedNumberArray(this.inkList));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        return ret;
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/Ink") {
            errorList.push(new annotation_errors_1.InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`));
        }
        if ('number' === typeof this.inkList[0]) {
            this.inkList = [this.inkList];
        }
        if (enact) {
            for (let error of errorList) {
                throw error;
            }
        }
        return errorList;
    }
    createDefaultAppearanceStream() {
        this.appearanceStream = new appearance_stream_1.AppStream(this);
        this.appearanceStream.new_object = true;
        let xobj = new appearance_stream_1.XObjectObj();
        xobj.object_id = this.factory.parser.getFreeObjectId();
        xobj.new_object = true;
        xobj.bBox = this.rect;
        xobj.matrix = [1, 0, 0, 1, -this.rect[0], -this.rect[1]];
        let cs = new content_stream_1.ContentStream();
        xobj.contentStream = cs;
        let cmo = cs.addMarkedContentObject(["/Tx"]);
        let go = cmo.addGraphicObject();
        if (this.opacity !== 1) {
            go.addOperator("gs", ["/GParameters"]);
            let gsp = new appearance_stream_1.GraphicsStateParameter(this.factory.parser.getFreeObjectId());
            gsp.CA = gsp.ca = this.opacity;
            this.additional_objects_to_write.push({ obj: gsp, func: ((ob) => ob.writeGStateParameter()) });
            let res = new resources_1.Resource();
            res.addGStateDef({ name: "/GParameters", refPtr: gsp.object_id });
            xobj.resources = res;
        }
        go.setLineColor({ r: 0, g: 0, b: 0 }).setFillColor(this.color);
        for (let inkl of this.inkList) {
            go.drawPolygon(inkl);
        }
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
}
exports.InkAnnotationObj = InkAnnotationObj;
//# sourceMappingURL=ink_annotation.js.map
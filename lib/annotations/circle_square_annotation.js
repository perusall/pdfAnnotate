"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquareAnnotationObj = exports.CircleAnnotationObj = exports.CircleSquareAnnotationObj = void 0;
const annotation_types_1 = require("./annotation_types");
const annotation_errors_1 = require("./annotation_errors");
const writer_util_1 = require("../writer-util");
const appearance_stream_1 = require("../appearance-stream");
const resources_1 = require("../resources");
const content_stream_1 = require("../content-stream");
class CircleSquareAnnotationObj extends annotation_types_1.MarkupAnnotationObj {
    constructor() {
        super();
        this.differenceRectangle = [];
    }
    writeAnnotationObject(cryptoInterface) {
        let ret = super.writeAnnotationObject(cryptoInterface);
        if (this.fill) {
            let fill = this.fill;
            if (fill.r > 1)
                fill.r /= 255;
            if (fill.g > 1)
                fill.g /= 255;
            if (fill.b > 1)
                fill.b /= 255;
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.FILL);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray([fill.r, fill.g, fill.b]));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.differenceRectangle && this.differenceRectangle.length > 0) {
            ret = ret.concat(writer_util_1.WriterUtil.DIFFERENCE_RECTANGLE);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.differenceRectangle));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        return ret;
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.fill) {
            errorList = errorList.concat(this.checkColor(this.fill));
        }
        if (enact) {
            for (let error of errorList) {
                throw error;
            }
        }
        return errorList;
    }
}
exports.CircleSquareAnnotationObj = CircleSquareAnnotationObj;
class CircleAnnotationObj extends CircleSquareAnnotationObj {
    constructor() {
        super();
        this.type = "/Circle";
        this.type_encoded = [47, 67, 105, 114, 99, 108, 101]; // = '/Circle'
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/Circle") {
            errorList.push(new annotation_errors_1.InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`));
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
        go.setLineColor({ r: 0, g: 0, b: 0 }).setFillColor(this.color).drawFillCircle(this.rect[0], this.rect[1], this.rect[2], this.rect[3]);
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
}
exports.CircleAnnotationObj = CircleAnnotationObj;
class SquareAnnotationObj extends CircleSquareAnnotationObj {
    constructor() {
        super();
        this.type = "/Square";
        this.type_encoded = [47, 83, 113, 117, 97, 114, 101]; // = '/Square'
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/Square") {
            errorList.push(new annotation_errors_1.InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`));
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
            this.additional_objects_to_write.push({ obj: gsp, func: ((ob, cryptoInterface) => ob.writeGStateParameter(cryptoInterface)) });
            let res = new resources_1.Resource();
            res.addGStateDef({ name: "/GParameters", refPtr: gsp.object_id });
            xobj.resources = res;
        }
        go.setLineColor({ r: 0, g: 0, b: 0 }).setFillColor(this.color).drawFillRect(this.rect[0], this.rect[1], this.rect[2], this.rect[3]);
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
}
exports.SquareAnnotationObj = SquareAnnotationObj;
//# sourceMappingURL=circle_square_annotation.js.map
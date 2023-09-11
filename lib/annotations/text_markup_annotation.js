"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrikeOutAnnotationObj = exports.SquigglyAnnotationObj = exports.UnderlineAnnotationObj = exports.HighlightAnnotationObj = exports.TextMarkupAnnotationObj = void 0;
const annotation_types_1 = require("./annotation_types");
const annotation_errors_1 = require("./annotation_errors");
const writer_util_1 = require("../writer-util");
const appearance_stream_1 = require("../appearance-stream");
const resources_1 = require("../resources");
const content_stream_1 = require("../content-stream");
class TextMarkupAnnotationObj extends annotation_types_1.MarkupAnnotationObj {
    constructor() {
        super(...arguments);
        this.quadPoints = [];
    }
    writeAnnotationObject(cryptoInterface) {
        let ret = super.writeAnnotationObject(cryptoInterface);
        ret = ret.concat(writer_util_1.WriterUtil.QUADPOINTS);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.writeNumberArray(this.quadPoints));
        ret.push(writer_util_1.WriterUtil.SPACE);
        return ret;
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (errorList.length === 1 && errorList[0] instanceof annotation_errors_1.InvalidRectError) {
            if (this.quadPoints && this.quadPoints.length > 0) {
                this.rect = this.extractRectFromQuadPoints(this.quadPoints);
                errorList = this.checkRect(4, this.rect);
            }
        }
        if (!this.quadPoints || this.quadPoints.length === 0) {
            let rect = this.rect;
            this.quadPoints = [rect[0], rect[3], rect[2], rect[3], rect[0], rect[1], rect[2], rect[1]];
        }
        errorList = errorList.concat(this.checkQuadPoints(this.quadPoints));
        if (enact) {
            for (let error of errorList) {
                throw error;
            }
        }
        return errorList;
    }
    /**
     * Extracts the rectangular hull from a quadPoint definition
     * */
    extractRectFromQuadPoints(quadPoints) {
        let x_values = quadPoints.filter((element, index) => index % 2 === 0);
        let y_values = quadPoints.filter((element, index) => index % 2 !== 0);
        return [Math.min(...x_values), Math.min(...y_values), Math.max(...x_values), Math.max(...y_values)];
    }
    /**
     * Checks the 'quadPoints' parameter
     * */
    checkQuadPoints(quadPoints) {
        let errorList = [];
        if (quadPoints.length % 8 !== 0)
            errorList.push(new annotation_errors_1.InvalidQuadPointError(`Quadpoints array has length ${quadPoints.length} but must be a multiple of 8`));
        quadPoints.forEach((a) => {
            if ('number' !== typeof a)
                errorList.push(new annotation_errors_1.InvalidQuadPointError("Quadpoint " + quadPoints + " has invalid entry: " + a));
        });
        return errorList;
    }
}
exports.TextMarkupAnnotationObj = TextMarkupAnnotationObj;
class HighlightAnnotationObj extends TextMarkupAnnotationObj {
    constructor() {
        super();
        this.type = "/Highlight";
        this.type_encoded = [47, 72, 105, 103, 104, 108, 105, 103, 104, 116]; // = '/Highlight'
    }
    createDefaultAppearanceStream() {
        this.appearanceStream = new appearance_stream_1.AppStream(this);
        this.appearanceStream.new_object = true;
        let xobj = new appearance_stream_1.XObjectObj();
        xobj.object_id = this.factory.parser.getFreeObjectId();
        xobj.new_object = true;
        xobj.bBox = [0, 0, 100, 100];
        xobj.matrix = [1, 0, 0, 1, 0, 0];
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
        if (this.quadPoints && this.quadPoints.length > 8) {
            go.setLineColor({ r: 0, g: 0, b: 0 }).setFillColor(this.color);
            for (let i = 0; i < this.quadPoints.length; i += 8) {
                let points = [];
                this.quadPoints.slice(i, i + 8).forEach((value, index) => index % 2 === 0 ? points.push(value - this.rect[0]) : points.push(value - this.rect[1]));
                go.fillPolygon([points[0], points[1], points[2], points[3], points[6], points[7], points[4], points[5]]);
            }
        }
        else {
            go.setLineColor({ r: 0, g: 0, b: 0 }).setFillColor(this.color).fillRect(0, 0, 100, 100, 25);
        }
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/Highlight") {
            errorList.push(new annotation_errors_1.InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`));
        }
        if (enact) {
            for (let error of errorList) {
                throw error;
            }
        }
        return errorList;
    }
}
exports.HighlightAnnotationObj = HighlightAnnotationObj;
class UnderlineAnnotationObj extends TextMarkupAnnotationObj {
    constructor() {
        super();
        this.type = "/Underline";
        this.type_encoded = [47, 85, 110, 100, 101, 114, 108, 105, 110, 101]; // = '/Underline'
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/Underline") {
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
        xobj.bBox = [0, 0, 100, 100];
        xobj.matrix = [1, 0, 0, 1, 0, 0];
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
        if (this.quadPoints && this.quadPoints.length > 8) {
            go.setLineColor(this.color);
            for (let i = 0; i < this.quadPoints.length; i += 8) {
                let points = [];
                this.quadPoints.slice(i, i + 8).forEach((value, index) => index % 2 === 0 ? points.push(value - this.rect[0]) : points.push(value - this.rect[1]));
                go.drawLine(points[0], points[1], points[2], points[1]);
            }
        }
        else {
            go.setLineColor(this.color).drawLine(0, 0, 100, 0);
        }
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
}
exports.UnderlineAnnotationObj = UnderlineAnnotationObj;
class SquigglyAnnotationObj extends TextMarkupAnnotationObj {
    constructor() {
        super();
        this.type = "/Squiggly";
        this.type_encoded = [47, 83, 113, 117, 105, 103, 103, 108, 121]; // = '/Squiggly'
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/Squiggly") {
            errorList.push(new annotation_errors_1.InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`));
        }
        if (enact) {
            for (let error of errorList) {
                throw error;
            }
        }
        return errorList;
    }
    /**
     * Draws a horizontal squiggly line
     * */
    drawSquigglyLine(go, x1, x2, y) {
        for (let i = x1; i < x2; i += 5) {
            if (i % 2 === 0) {
                go.drawLine(i, y, i + 5, y + 5);
            }
            else {
                go.drawLine(i, y + 5, i + 5, y);
            }
        }
    }
    createDefaultAppearanceStream() {
        this.appearanceStream = new appearance_stream_1.AppStream(this);
        this.appearanceStream.new_object = true;
        let xobj = new appearance_stream_1.XObjectObj();
        xobj.object_id = this.factory.parser.getFreeObjectId();
        xobj.new_object = true;
        xobj.bBox = [0, 0, 100, 100];
        xobj.matrix = [1, 0, 0, 1, 0, 0];
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
        if (this.quadPoints && this.quadPoints.length > 8) {
            go.setLineColor(this.color);
            for (let i = 0; i < this.quadPoints.length; i += 8) {
                let points = [];
                this.quadPoints.slice(i, i + 8).forEach((value, index) => index % 2 === 0 ? points.push(value - this.rect[0]) : points.push(value - this.rect[1]));
                this.drawSquigglyLine(go, points[0], points[2], points[1]);
            }
        }
        else {
            go.setLineColor(this.color);
            this.drawSquigglyLine(go, 0, 100, 0);
        }
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
}
exports.SquigglyAnnotationObj = SquigglyAnnotationObj;
class StrikeOutAnnotationObj extends TextMarkupAnnotationObj {
    constructor() {
        super();
        this.type = "/StrikeOut";
        this.type_encoded = [47, 83, 116, 114, 105, 107, 101, 79, 117, 116]; // = '/StrikeOut'
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/StrikeOut") {
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
        xobj.bBox = [0, 0, 100, 100];
        xobj.matrix = [1, 0, 0, 1, 0, 0];
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
        if (this.quadPoints && this.quadPoints.length > 8) {
            go.setLineColor(this.color);
            for (let i = 0; i < this.quadPoints.length; i += 8) {
                let points = [];
                this.quadPoints.slice(i, i + 8).forEach((value, index) => index % 2 === 0 ? points.push(value - this.rect[0]) : points.push(value - this.rect[1]));
                let y_value = (points[5] - points[1]) / 2 + points[1];
                go.drawLine(points[0], y_value, points[2], y_value);
            }
        }
        else {
            go.setLineColor(this.color).drawLine(0, 50, 100, 50);
        }
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
}
exports.StrikeOutAnnotationObj = StrikeOutAnnotationObj;
//# sourceMappingURL=text_markup_annotation.js.map
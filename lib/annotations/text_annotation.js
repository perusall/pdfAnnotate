"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextAnnotationObj = exports.AnnotationState = exports.AnnotationStateModel = exports.AnnotationIcon = void 0;
const annotation_types_1 = require("./annotation_types");
const annotation_errors_1 = require("./annotation_errors");
const writer_util_1 = require("../writer-util");
const util_1 = require("../util");
const appearance_stream_1 = require("../appearance-stream");
const resources_1 = require("../resources");
const content_stream_1 = require("../content-stream");
var AnnotationIcon;
(function (AnnotationIcon) {
    AnnotationIcon[AnnotationIcon["Comment"] = 0] = "Comment";
    AnnotationIcon[AnnotationIcon["Key"] = 1] = "Key";
    AnnotationIcon[AnnotationIcon["Note"] = 2] = "Note";
    AnnotationIcon[AnnotationIcon["Help"] = 3] = "Help";
    AnnotationIcon[AnnotationIcon["NewParagraph"] = 4] = "NewParagraph";
    AnnotationIcon[AnnotationIcon["Paragraph"] = 5] = "Paragraph";
    AnnotationIcon[AnnotationIcon["Insert"] = 6] = "Insert";
})(AnnotationIcon = exports.AnnotationIcon || (exports.AnnotationIcon = {}));
var AnnotationStateModel;
(function (AnnotationStateModel) {
    AnnotationStateModel[AnnotationStateModel["Marked"] = 0] = "Marked";
    AnnotationStateModel[AnnotationStateModel["Review"] = 1] = "Review";
})(AnnotationStateModel = exports.AnnotationStateModel || (exports.AnnotationStateModel = {}));
var AnnotationState;
(function (AnnotationState) {
    AnnotationState[AnnotationState["Marked"] = 0] = "Marked";
    AnnotationState[AnnotationState["Unmarked"] = 1] = "Unmarked";
    AnnotationState[AnnotationState["Accepted"] = 2] = "Accepted";
    AnnotationState[AnnotationState["Rejected"] = 3] = "Rejected";
    AnnotationState[AnnotationState["Cancelled"] = 4] = "Cancelled";
    AnnotationState[AnnotationState["Completed"] = 5] = "Completed";
    AnnotationState[AnnotationState["None"] = 6] = "None";
})(AnnotationState = exports.AnnotationState || (exports.AnnotationState = {}));
class TextAnnotationObj extends annotation_types_1.MarkupAnnotationObj {
    constructor() {
        super();
        this.open = false;
        this.icon = AnnotationIcon.Note;
        this.state = undefined;
        this.type = "/Text";
        this.type_encoded = [47, 84, 101, 120, 116]; // = '/Text'
        // demanded by PDF specification (p. 394 - 12.5.6.4 Text Annotations)
        this.annotationFlags = { noZoom: true, noRotate: true };
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
        go.setLineColor({ r: 0, g: 0, b: 0 }).setFillColor(this.color).drawFillRect(0, 0, 100, 100, 25);
        switch (this.icon) {
            case AnnotationIcon.Help:
                go.addTextObject().setColor().setFont("/F1", 120).setText("?", [20, 10]);
                break;
            case AnnotationIcon.Insert:
                throw Error("Not yet implemented. Pls. create ticket on Github with feature request.");
                break;
            case AnnotationIcon.Key:
                throw Error("Not yet implemented. Pls. create ticket on Github with feature request.");
                break;
            case AnnotationIcon.NewParagraph:
                throw Error("Not yet implemented. Pls. create ticket on Github with feature request.");
                break;
            case AnnotationIcon.Paragraph:
                throw Error("Not yet implemented. Pls. create ticket on Github with feature request.");
                break;
            default:
                go.drawPolygon([10, 10, 10, 90, 80, 90, 80, 80, 90, 80, 90, 10, 10, 10]).drawLine(80, 90, 90, 80);
        }
        this.appearanceStream.N = xobj;
        this.additional_objects_to_write.push({ obj: xobj, func: ((ob, cryptoInterface) => ob.writeXObject(cryptoInterface)) });
    }
    convertAnnotationIcon(icon) {
        switch (icon) {
            case AnnotationIcon.Comment:
                return [47, 67, 111, 109, 109, 101, 110, 116]; // = '/Comment'
            case AnnotationIcon.Key:
                return [47, 75, 101, 121]; // = '/Key'
            case AnnotationIcon.Note:
                return [47, 78, 111, 116, 101]; // = '/Note'
            case AnnotationIcon.Help:
                return [47, 72, 101, 108, 112]; // = '/Help'
            case AnnotationIcon.NewParagraph:
                return [47, 78, 101, 119, 80, 97, 114, 97, 103, 114, 97, 112, 104]; // = '/NewParagraph'
            case AnnotationIcon.Paragraph:
                return [47, 80, 97, 114, 97, 103, 114, 97, 112, 104]; // = '/Paragraph'
            case AnnotationIcon.Insert:
                return [47, 73, 110, 115, 101, 114, 116]; // = '/Insert'
        }
        return [];
    }
    convertState(state) {
        switch (state) {
            case AnnotationState.Marked:
                return util_1.Util.convertStringToAscii("/Marked");
            case AnnotationState.Unmarked:
                return util_1.Util.convertStringToAscii("/Unmarked");
            case AnnotationState.Accepted:
                return util_1.Util.convertStringToAscii("/Accepted");
            case AnnotationState.Rejected:
                return util_1.Util.convertStringToAscii("/Rejected");
            case AnnotationState.Cancelled:
                return util_1.Util.convertStringToAscii("/Cancelled");
            case AnnotationState.Completed:
                return util_1.Util.convertStringToAscii("/Completed");
            case AnnotationState.None:
                return util_1.Util.convertStringToAscii("/None");
        }
        return [];
    }
    convertStateModel(stateModel) {
        switch (stateModel) {
            case AnnotationStateModel.Marked:
                return util_1.Util.convertStringToAscii("/Marked");
            case AnnotationStateModel.Review:
                return util_1.Util.convertStringToAscii("/Review");
        }
        return [];
    }
    writeAnnotationObject(cryptoInterface) {
        let ret = super.writeAnnotationObject(cryptoInterface);
        if (this.open) {
            ret = ret.concat(writer_util_1.WriterUtil.OPEN);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(writer_util_1.WriterUtil.TRUE);
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.icon) {
            ret = ret.concat(writer_util_1.WriterUtil.NAME);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.convertAnnotationIcon(this.icon));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.state) {
            ret = ret.concat(writer_util_1.WriterUtil.STATE);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.convertState(this.state));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        if (this.stateModel) {
            ret = ret.concat(writer_util_1.WriterUtil.STATEMODEL);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(this.convertStateModel(this.stateModel));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        return ret;
    }
    validate(enact = true) {
        let errorList = super.validate(false);
        if (this.type !== "/Text") {
            errorList.push(new annotation_errors_1.InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`));
        }
        if (this.state && !this.stateModel) {
            errorList.push(new annotation_errors_1.InvalidStateError("You need to specify a state model, when specifying a state"));
        }
        if (this.stateModel && !this.state) {
            if (this.stateModel.valueOf() === AnnotationStateModel.Marked) {
                this.state = AnnotationState.Unmarked;
            }
            else if (this.stateModel.valueOf() === AnnotationStateModel.Review) {
                this.state = AnnotationState.None;
            }
            else {
                errorList.push(new annotation_errors_1.InvalidStateError("Invalid state model selected"));
            }
        }
        if (this.state && this.stateModel) {
            if (this.stateModel.valueOf() === AnnotationStateModel.Marked) {
                if (this.state.valueOf() !== AnnotationState.Marked && this.state.valueOf() !== AnnotationState.Unmarked) {
                    errorList.push(new annotation_errors_1.InvalidStateError("Invalid annotation state for state model 'Marked' only 'Marked' and 'Unmarked' are legal values"));
                }
            }
            else if (this.stateModel.valueOf() === AnnotationStateModel.Review) {
                if (this.state.valueOf() !== AnnotationState.Accepted && this.state.valueOf() !== AnnotationState.Rejected &&
                    this.state.valueOf() !== AnnotationState.Cancelled && this.state.valueOf() !== AnnotationState.Completed &&
                    this.state.valueOf() !== AnnotationState.None) {
                    errorList.push(new annotation_errors_1.InvalidStateError("Invalid annotation state for state model 'Review' only 'Accepted', 'Rejected', 'Cancelled', 'Completed' and 'None' are legal values"));
                }
            }
            else {
                errorList.push(new annotation_errors_1.InvalidStateError("Invalid state model selected"));
            }
        }
        if (enact) {
            for (let error of errorList) {
                throw error;
            }
        }
        return errorList;
    }
}
exports.TextAnnotationObj = TextAnnotationObj;
//# sourceMappingURL=text_annotation.js.map
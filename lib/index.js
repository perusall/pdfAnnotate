"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("./parser");
Object.defineProperty(exports, "PDFDocumentParser", { enumerable: true, get: function () { return parser_1.PDFDocumentParser; } });
var annotation_types_1 = require("./annotations/annotation_types");
Object.defineProperty(exports, "LineEndingStyle", { enumerable: true, get: function () { return annotation_types_1.LineEndingStyle; } });
var text_annotation_1 = require("./annotations/text_annotation");
Object.defineProperty(exports, "AnnotationIcon", { enumerable: true, get: function () { return text_annotation_1.AnnotationIcon; } });
Object.defineProperty(exports, "AnnotationState", { enumerable: true, get: function () { return text_annotation_1.AnnotationState; } });
Object.defineProperty(exports, "AnnotationStateModel", { enumerable: true, get: function () { return text_annotation_1.AnnotationStateModel; } });
var freetext_annotation_1 = require("./annotations/freetext_annotation");
Object.defineProperty(exports, "TextJustification", { enumerable: true, get: function () { return freetext_annotation_1.TextJustification; } });
Object.defineProperty(exports, "FreeTextType", { enumerable: true, get: function () { return freetext_annotation_1.FreeTextType; } });
var util_1 = require("./util");
Object.defineProperty(exports, "Util", { enumerable: true, get: function () { return util_1.Util; } });
var annotation_1 = require("./annotation");
Object.defineProperty(exports, "AnnotationFactory", { enumerable: true, get: function () { return annotation_1.AnnotationFactory; } });
//# sourceMappingURL=index.js.map
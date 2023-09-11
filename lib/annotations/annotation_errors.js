"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidFontError = exports.InvalidFontSizeError = exports.InvalidAppearanceStreamError = exports.InvalidAnnotationReference = exports.InvalidVerticesError = exports.InvalidQuadPointError = exports.InvalidStateError = exports.InvalidIDError = exports.InvalidRectError = exports.InvalidDateError = exports.InvalidReferencePointerError = exports.ColorOutOfRangeError = exports.InvalidColorError = exports.InvalidOpacityError = exports.InvalidAnnotationTypeError = void 0;
class InvalidAnnotationTypeError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidAnnotationTypeError";
    }
}
exports.InvalidAnnotationTypeError = InvalidAnnotationTypeError;
class InvalidOpacityError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidOpacityError";
    }
}
exports.InvalidOpacityError = InvalidOpacityError;
class InvalidColorError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidColorError";
    }
}
exports.InvalidColorError = InvalidColorError;
class ColorOutOfRangeError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "ColorOutOfRangeError";
    }
}
exports.ColorOutOfRangeError = ColorOutOfRangeError;
class InvalidReferencePointerError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidReferencePointerError";
    }
}
exports.InvalidReferencePointerError = InvalidReferencePointerError;
class InvalidDateError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidDateError";
    }
}
exports.InvalidDateError = InvalidDateError;
class InvalidRectError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidRectError";
    }
}
exports.InvalidRectError = InvalidRectError;
class InvalidIDError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidIDError";
    }
}
exports.InvalidIDError = InvalidIDError;
class InvalidStateError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidStateError";
    }
}
exports.InvalidStateError = InvalidStateError;
class InvalidQuadPointError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidQuadPointError";
    }
}
exports.InvalidQuadPointError = InvalidQuadPointError;
class InvalidVerticesError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidVerticesError";
    }
}
exports.InvalidVerticesError = InvalidVerticesError;
class InvalidAnnotationReference extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidAnnotationError";
    }
}
exports.InvalidAnnotationReference = InvalidAnnotationReference;
class InvalidAppearanceStreamError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidAppearanceStreamError";
    }
}
exports.InvalidAppearanceStreamError = InvalidAppearanceStreamError;
class InvalidFontSizeError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidFontSizeError";
    }
}
exports.InvalidFontSizeError = InvalidFontSizeError;
class InvalidFontError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidFontError";
    }
}
exports.InvalidFontError = InvalidFontError;
//# sourceMappingURL=annotation_errors.js.map
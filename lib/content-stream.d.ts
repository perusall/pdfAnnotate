import { ReferencePointer } from './parser';
import { Color } from './annotations/annotation_types';
import { Font } from './fonts';
import { TextJustification } from './annotations/freetext_annotation';
export declare class Operator {
    name: string;
    parameters: (number | string | ReferencePointer)[];
    operators: Operator[];
    constructor(name?: string, parameters?: (number | string | ReferencePointer)[]);
    /**
     * Transforms operator to byte array
     * */
    toByteArray(noLineFeed?: boolean): number[];
    /**
     * Adds the provided operator
     * */
    addOperator(arg: string | Operator, params?: any[]): void;
    /**
     * Add marked content object to stream
     * */
    addMarkedContentObject(params?: any[]): MarkedContent;
    /**
     * Add a graphic state to the content stream
     * */
    addGraphicObject(): GraphicsObject;
    /**
     * Add a text objct to the content stream
     * */
    addTextObject(): TextObject;
}
export declare class MarkedContent extends Operator {
    constructor(params?: any[]);
}
export declare class GraphicsObject extends Operator {
    drawFillRect(x_1: number, y_1: number, x_2: number, y_2: number, cornerRadius?: number | undefined, linewidth?: number): GraphicsObject;
    fillRect(x_1: number, y_1: number, x_2: number, y_2: number, cornerRadius?: number | undefined): GraphicsObject;
    drawFillCircle(x_1: number, y_1: number, x_2: number, y_2: number, linewidth?: number): GraphicsObject;
    fillCircle(x_1: number, y_1: number, x_2: number, y_2: number): GraphicsObject;
    /**
     * Draws a circle (or an oval) where the rectangle defined by the coordinates represents the bounding box
     * */
    drawCircle(x_1: number, y_1: number, x_2: number, y_2: number, linewidth?: number): GraphicsObject;
    drawRect(x_1: number, y_1: number, x_2: number, y_2: number, cornerRadius?: number | undefined, linewidth?: number): GraphicsObject;
    drawFillPolygon(points: number[], linewidth?: number): GraphicsObject;
    drawPolygon(points: number[], linewidth?: number): GraphicsObject;
    fillPolygon(points: number[]): GraphicsObject;
    drawLine(x_1: number, y_1: number, x_2: number, y_2: number, linewidth?: number): GraphicsObject;
    setLineColor(color?: Color | undefined): GraphicsObject;
    setFillColor(color?: Color | undefined): GraphicsObject;
}
export declare class TextObject extends Operator {
    static readonly SINGLE_CHAR_WIDTH = 10;
    constructor();
    /**
     * Places text relative from the last given position or Tm object (origin) with + x_rel, + y_rel location
     * */
    setTextRelative(text: string, x_rel?: number | number[] | undefined, y_rel?: number | undefined): this | undefined;
    /**
     * Places text absolut at the current position or if provided at the x, y coordinates
     *
     * Uses a '1 0 0 1 x y Tm' for placing. So this method cannot be used for scaling.
     * */
    setText(text: string, x?: number | number[] | undefined, y?: number | undefined): TextObject;
    /**
     * Places a text in the rectangle defined by 'rect'. It applies text justification.
     *
     * It applies line breaks. It first tries linebreaking at spaces between words and if that is not possible it will break between letters
     * */
    formatText(text: string, font: Font, textSize: number, rect: number[], justification?: TextJustification | undefined): TextObject;
    setFont(font?: string, fontSize?: number): TextObject;
    setColor(color?: Color | undefined): TextObject;
}
export declare class ContentStream extends Operator {
    /**
     * True, if the content stream is empty
     * */
    isEmpty(): boolean;
    /**
     * Outputs the content stream as byte sequence
     * */
    writeContentStream(noLineFeed?: boolean): number[];
}

import { MarkupAnnotation, MarkupAnnotationObj, Color, LineEndingStyle } from './annotation_types';
import { ErrorList } from './annotation_errors';
import { CryptoInterface } from '../parser';
export declare enum PolygonPolyLineIntent {
    PolygonCloud = 0,
    PolyLineDimension = 1,
    PolygonDimension = 2
}
export interface PolygonPolyLineAnnotation extends MarkupAnnotation {
    vertices: number[];
    borderStyle?: any;
    fill?: Color;
    intent?: PolygonPolyLineIntent;
    measure?: any;
}
export declare class PolygonPolyLineAnnotationObj extends MarkupAnnotationObj implements PolygonPolyLineAnnotation {
    fill: Color | undefined;
    vertices: number[];
    constructor();
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    validate(enact?: boolean): ErrorList;
}
export interface PolyLineAnnotation extends PolygonPolyLineAnnotation {
    lineEndingStyles?: LineEndingStyle[];
}
export declare class PolyLineAnnotationObj extends PolygonPolyLineAnnotationObj implements PolyLineAnnotation {
    lineEndingStyles: LineEndingStyle[];
    constructor();
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}
export interface PolygonAnnotation extends PolygonPolyLineAnnotation {
    borderEffect?: any;
}
export declare class PolygonAnnotationObj extends PolygonPolyLineAnnotationObj implements PolygonAnnotation {
    constructor();
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}

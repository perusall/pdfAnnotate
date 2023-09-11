import { MarkupAnnotation, MarkupAnnotationObj, Color } from './annotation_types';
import { ErrorList } from './annotation_errors';
import { CryptoInterface } from '../parser';
export interface CircleSquareAnnotation extends MarkupAnnotation {
    borderStyle?: any;
    fill?: Color;
    borderEffect?: any;
    differenceRectangle?: number[];
}
export declare class CircleSquareAnnotationObj extends MarkupAnnotationObj implements CircleSquareAnnotation {
    fill: Color | undefined;
    differenceRectangle: number[];
    constructor();
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    validate(enact?: boolean): ErrorList;
}
export declare class CircleAnnotationObj extends CircleSquareAnnotationObj {
    constructor();
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}
export declare class SquareAnnotationObj extends CircleSquareAnnotationObj {
    constructor();
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}

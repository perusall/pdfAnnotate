import { MarkupAnnotation, MarkupAnnotationObj } from './annotation_types';
import { CryptoInterface } from '../parser';
import { ErrorList } from './annotation_errors';
export interface TextMarkupAnnotation extends MarkupAnnotation {
    quadPoints: number[];
}
export declare class TextMarkupAnnotationObj extends MarkupAnnotationObj implements TextMarkupAnnotation {
    quadPoints: number[];
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    validate(enact?: boolean): ErrorList;
    /**
     * Extracts the rectangular hull from a quadPoint definition
     * */
    private extractRectFromQuadPoints;
    /**
     * Checks the 'quadPoints' parameter
     * */
    private checkQuadPoints;
}
export declare class HighlightAnnotationObj extends TextMarkupAnnotationObj {
    constructor();
    createDefaultAppearanceStream(): void;
    validate(enact?: boolean): ErrorList;
}
export declare class UnderlineAnnotationObj extends TextMarkupAnnotationObj {
    constructor();
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}
export declare class SquigglyAnnotationObj extends TextMarkupAnnotationObj {
    constructor();
    validate(enact?: boolean): ErrorList;
    /**
     * Draws a horizontal squiggly line
     * */
    private drawSquigglyLine;
    createDefaultAppearanceStream(): void;
}
export declare class StrikeOutAnnotationObj extends TextMarkupAnnotationObj {
    constructor();
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}

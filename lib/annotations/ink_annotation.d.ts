import { MarkupAnnotation, MarkupAnnotationObj } from './annotation_types';
import { ErrorList } from './annotation_errors';
import { CryptoInterface } from '../parser';
export interface InkAnnotation extends MarkupAnnotation {
    inkList: number[][];
    borderStyle?: any;
}
export declare class InkAnnotationObj extends MarkupAnnotationObj implements InkAnnotation {
    inkList: number[][];
    constructor();
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}

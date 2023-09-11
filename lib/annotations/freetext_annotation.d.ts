import { MarkupAnnotation, MarkupAnnotationObj, LineEndingStyle, Color } from './annotation_types';
import { ErrorList } from './annotation_errors';
import { CryptoInterface } from '../parser';
import { Resource } from '../resources';
import { ContentStream } from '../content-stream';
import { Font } from '../fonts';
export declare enum TextJustification {
    Left = 0,
    Centered = 1,
    Right = 2
}
export declare enum FreeTextType {
    FreeText = 0,
    FreeTextCallout = 1,
    FreeTextTypeWriter = 2
}
export interface FreeTextAnnotation extends MarkupAnnotation {
    textJustification?: TextJustification;
    defaultAppearance: ContentStream;
    defaultStyleString?: string;
    calloutLine?: number[];
    freeTextType?: FreeTextType;
    borderEffect?: any;
    borderStyle?: any;
    differenceRectangle?: number[];
    lineEndingStyle?: LineEndingStyle;
    font: string | Font;
    fontSize: number;
    textColor: Color | undefined;
}
export declare class FreeTextAnnotationObj extends MarkupAnnotationObj implements FreeTextAnnotation {
    defaultAppearance: ContentStream;
    defaultStyleString: string | undefined;
    differenceRectangle: number[];
    textJustification: TextJustification;
    calloutLine: number[];
    freeTextType: FreeTextType;
    lineEndingStyle: LineEndingStyle;
    font: string | Font;
    fontSize: number;
    resources: Resource | undefined;
    textColor: Color | undefined;
    constructor();
    private convertJustification;
    private convertFreeTextType;
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    validate(enact?: boolean): ErrorList;
    createDefaultAppearanceStream(): void;
}

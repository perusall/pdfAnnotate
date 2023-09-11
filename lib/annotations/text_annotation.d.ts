import { MarkupAnnotation, MarkupAnnotationObj } from './annotation_types';
import { CryptoInterface } from '../parser';
import { ErrorList } from './annotation_errors';
export declare enum AnnotationIcon {
    Comment = 0,
    Key = 1,
    Note = 2,
    Help = 3,
    NewParagraph = 4,
    Paragraph = 5,
    Insert = 6
}
export declare enum AnnotationStateModel {
    Marked = 0,
    Review = 1
}
export declare enum AnnotationState {
    Marked = 0,
    Unmarked = 1,
    Accepted = 2,
    Rejected = 3,
    Cancelled = 4,
    Completed = 5,
    None = 6
}
export interface TextAnnotation extends MarkupAnnotation {
    open: boolean;
    icon: AnnotationIcon;
    state: AnnotationState | undefined;
    stateModel?: AnnotationStateModel;
}
export declare class TextAnnotationObj extends MarkupAnnotationObj implements TextAnnotation {
    open: boolean;
    icon: AnnotationIcon;
    state: AnnotationState | undefined;
    stateModel?: AnnotationStateModel;
    constructor();
    createDefaultAppearanceStream(): void;
    convertAnnotationIcon(icon: AnnotationIcon): number[];
    convertState(state: AnnotationState): number[];
    convertStateModel(stateModel: AnnotationStateModel): number[];
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    validate(enact?: boolean): ErrorList;
}

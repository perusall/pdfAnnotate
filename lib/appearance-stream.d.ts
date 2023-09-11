import { ReferencePointer, Annotation } from './parser';
import { ContentStream } from './content-stream';
import { Resource } from './resources';
import { CryptoInterface } from './parser';
export interface OnOffAppearanceStream {
    on: XObject;
    off: XObject;
}
export interface AppearanceStream {
    N: XObject | OnOffAppearanceStream | ReferencePointer | undefined;
    R?: XObject | OnOffAppearanceStream | ReferencePointer | undefined;
    D?: XObject | OnOffAppearanceStream | ReferencePointer | undefined;
}
export declare class AppStream implements AppearanceStream {
    object_id: ReferencePointer | undefined;
    new_object: boolean;
    N: XObject | OnOffAppearanceStream | ReferencePointer | undefined;
    R: XObject | OnOffAppearanceStream | ReferencePointer | undefined;
    D: XObject | OnOffAppearanceStream | ReferencePointer | undefined;
    annot: Annotation;
    constructor(annot: Annotation);
    /**
     * Lookups the N content stream. If it is only provided by a reference pointer it will parse
     * the corresponding Xobject
     * */
    lookupNContentStream(): void;
    /**
     * Helper writer function of the references. Resolves different types
     * */
    private writeAppearanceStreamObj;
    /**
     * Writes the appearance stream object
     * */
    writeAppearanceStream(): number[];
}
export interface XObject {
    type?: string;
    formType?: number | undefined;
    bBox: number[];
    matrix?: number[] | undefined;
    resources?: Resource | undefined;
    group?: undefined;
    ref?: undefined;
    metaData?: undefined;
    pieceInfo?: undefined;
    lastModified?: string | Date;
    structParent?: number | undefined;
    structParents?: number | undefined;
    opi?: undefined;
    oc?: undefined;
    name: string;
}
export declare class XObjectObj implements XObject {
    object_id: ReferencePointer | undefined;
    new_object: boolean;
    type: string;
    type_encoded: number[];
    bBox: number[];
    name: string;
    matrix: number[];
    formType: number;
    contentStream: ContentStream | undefined;
    resources: Resource | undefined;
    constructor();
    /**
     * Adds a content stream operator
     * */
    addOperator(operator: string, parameters?: any[]): void;
    writeXObject(cryptoInterface: CryptoInterface): number[];
}
export declare class GraphicsStateParameter {
    object_id: ReferencePointer | undefined;
    new_object: boolean;
    type: string;
    type_encoded: number[];
    CA: number | undefined;
    ca: number | undefined;
    constructor(object_id?: ReferencePointer | undefined);
    writeGStateParameter(): number[];
}

import { Annotation, ReferencePointer, PDFDocumentParser, Page } from './parser';
import { XRef } from './document-history';
/**
 * Creats the byte array that must be attached to the end of the document
 * */
export declare class Writer {
    private data;
    private annotations;
    private toDelete;
    private parser;
    /**
     * Holds the crossite reference table
     * */
    private xrefs;
    private cryptoInterface;
    /**
     * data : The data representing the original PDF document
     * aannotations : The annotations to add to the document
     * */
    constructor(data: Uint8Array, annotations: Annotation[], toDelete: Annotation[], parser: PDFDocumentParser);
    /**
     * Sorts the annotations pagewise.
     *
     * This is necessary since the annotation arrays of the sites must be extended
     * and it makes sense to do this update in one step.
     * */
    sortPageWise(annotations: Annotation[]): {
        [item: number]: Annotation[];
    };
    /**
     * It returns the page object either extended by a /Annots field, if this did not exist yet or with the annots field replaced by a rerference pointer
     * to an array if the page object contains the list of annotations directly
     *
     * ptr : Pointer to the page object
     * annot_array_reference : The reference to the annotation array
     * */
    adaptPageObject(page: Page, annot_array_reference: ReferencePointer): number[];
    /**
     * Takes the annotations of >>one<< page and derives the annotations array from it.
     * Thereby it also considers the potentially existing annotation array.
     *
     * toDelete := contains those annotations that must be deleted. It removes them from the reference array
     * and marks them as removed
     * */
    writeAnnotArray(annots: Annotation[], toDelete: Annotation[]): {
        ptr: ReferencePointer;
        data: number[];
        pageReference: ReferencePointer;
        pageData: number[];
    };
    /**
     * Writes an annotation object
     * */
    writeAnnotationObject(annot: Annotation): {
        ptr: ReferencePointer;
        data: number[];
    };
    /**
     * Takes all the cross site reference table entries and extracts the consecutive sequences
     * */
    computeXrefSequences(): XRef[][];
    /**
     * Constructs the pointers of the linked list that contains the ids of freed objects
     * */
    applyObjectFreeing(refs: XRef[]): XRef[];
    /**
     * Writes the crossite reference table
     * */
    writeCrossSiteReferenceTable(): number[];
    /**
     * Writes the trailer
     * */
    writeTrailer(posXref: number): number[];
    /**
     * Writes the annations at the end of the PDF byte representation and returns
     * the byte array
     * */
    write(): Uint8Array;
    /**
     * Removes the given annotation
     * */
    updatePageAnnotationReferenceArray(toDelete: Annotation[]): {
        ptr: ReferencePointer;
        data: number[];
    };
}

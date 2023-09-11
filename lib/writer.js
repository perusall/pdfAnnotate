"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Writer = void 0;
const util_1 = require("./util");
const object_util_1 = require("./object-util");
const writer_util_1 = require("./writer-util");
/**
 * Creats the byte array that must be attached to the end of the document
 * */
class Writer {
    /**
     * data : The data representing the original PDF document
     * aannotations : The annotations to add to the document
     * */
    constructor(data, annotations, toDelete, parser) {
        this.data = data;
        this.annotations = annotations;
        this.toDelete = toDelete;
        this.parser = parser;
        /**
         * Holds the crossite reference table
         * */
        this.xrefs = [];
        this.data = new Uint8Array(data);
        this.cryptoInterface = parser.getCryptoInterface();
    }
    /**
     * Sorts the annotations pagewise.
     *
     * This is necessary since the annotation arrays of the sites must be extended
     * and it makes sense to do this update in one step.
     * */
    sortPageWise(annotations) {
        let pageAnnots = {};
        for (let annot of annotations) {
            if (!pageAnnots[annot.page])
                pageAnnots[annot.page] = [];
            pageAnnots[annot.page].push(annot);
        }
        return pageAnnots;
    }
    /**
     * It returns the page object either extended by a /Annots field, if this did not exist yet or with the annots field replaced by a rerference pointer
     * to an array if the page object contains the list of annotations directly
     *
     * ptr : Pointer to the page object
     * annot_array_reference : The reference to the annotation array
     * */
    adaptPageObject(page, annot_array_reference) {
        if (!page.object_id)
            throw Error("Page without object id");
        let ret = [];
        let lookupTable = this.parser.documentHistory.createObjectLookupTable();
        let page_ptr = lookupTable[page.object_id.obj];
        if (page_ptr.compressed) {
            let obj = object_util_1.ObjectUtil.extractObject(this.data, page_ptr, lookupTable);
            let obj_data = obj.stream.getData().slice(obj.pointer_stream_start, obj.pointer_stream_end + 1);
            let ref_ptr = writer_util_1.WriterUtil.writeReferencePointer(obj.id, false).concat(32);
            let new_data = new Uint8Array(ref_ptr.length + writer_util_1.WriterUtil.OBJ.length + obj_data.length + writer_util_1.WriterUtil.ENDOBJ.length);
            new_data.set(ref_ptr);
            new_data.set(writer_util_1.WriterUtil.OBJ, ref_ptr.length);
            new_data.set(obj_data, writer_util_1.WriterUtil.OBJ.length + ref_ptr.length);
            new_data.set(writer_util_1.WriterUtil.ENDOBJ, writer_util_1.WriterUtil.OBJ.length + obj_data.length + ref_ptr.length);
            return writer_util_1.WriterUtil.replaceAnnotsFieldInPageObject(new_data, page, 0, annot_array_reference);
        }
        return writer_util_1.WriterUtil.replaceAnnotsFieldInPageObject(this.data, page, page_ptr.pointer, annot_array_reference);
    }
    /**
     * Takes the annotations of >>one<< page and derives the annotations array from it.
     * Thereby it also considers the potentially existing annotation array.
     *
     * toDelete := contains those annotations that must be deleted. It removes them from the reference array
     * and marks them as removed
     * */
    writeAnnotArray(annots, toDelete) {
        let page = annots[0].pageReference;
        if (!page)
            throw Error("Missing page reference");
        if (!page.object_id)
            throw Error("Page without object id");
        let references = page.annots;
        references = references.concat(annots.map((x) => {
            if (!x.object_id)
                throw Error("Annotation with object_id null");
            return x.object_id;
        }));
        // remove annotation references from the array that must be deleted and mark them as deleted
        references = references.filter((a) => {
            let toDel = toDelete.find((t) => t.object_id.obj === a.obj && t.object_id.generation === a.generation);
            if (toDel) {
                toDel.is_deleted = true;
                return false;
            }
            return true;
        });
        let refArray_id = page.annotsPointer;
        let page_data = [];
        if (!refArray_id) {
            refArray_id = this.parser.getFreeObjectId();
            page_data = this.adaptPageObject(page, refArray_id);
        }
        let ret = writer_util_1.WriterUtil.writeReferencePointer(refArray_id);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.OBJ);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret.push(writer_util_1.WriterUtil.ARRAY_START);
        for (let an of references) {
            ret = ret.concat(writer_util_1.WriterUtil.writeReferencePointer(an, true));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        ret.push(writer_util_1.WriterUtil.ARRAY_END);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.ENDOBJ);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        return { ptr: refArray_id, data: ret, pageReference: page.object_id, pageData: page_data };
    }
    /**
     * Writes an annotation object
     * */
    writeAnnotationObject(annot) {
        //if ((annot as _Annotation).stampType) {
        //    ret = ret.concat(Writer.NAME)
        //    ret.push(Writer.SPACE)
        //    ret = ret.concat(Writer.DRAFT)
        //    ret.push(Writer.SPACE)
        //}
        //if ((annot as _Annotation).caretSymbol) {
        //    ret = ret.concat(Writer.SY)
        //    ret.push(Writer.SPACE)
        //    ret.push(Writer.P)
        //    ret.push(Writer.SPACE)
        //}
        let ret = annot.writeAnnotationPreamble();
        ret = ret.concat(annot.writeAnnotationObject(this.cryptoInterface));
        ret = ret.concat(annot.writeAnnotationPostamble());
        return { ptr: annot.object_id, data: ret };
    }
    /**
     * Takes all the cross site reference table entries and extracts the consecutive sequences
     * */
    computeXrefSequences() {
        let seqs = [];
        let ordered_xrefs = this.xrefs.sort((a, b) => {
            if (a.id < b.id)
                return -1;
            if (a.id > b.id)
                return 1;
            return 0;
        });
        let seq = [ordered_xrefs[0]];
        let last_id = ordered_xrefs[0].id;
        seqs.push(seq);
        for (let i = 1; i < ordered_xrefs.length; ++i) {
            if (ordered_xrefs[i].id === last_id + 1) {
                seq.push(ordered_xrefs[i]);
            }
            else {
                seq = [ordered_xrefs[i]];
                seqs.push(seq);
            }
            last_id = ordered_xrefs[i].id;
        }
        return seqs;
    }
    /**
     * Constructs the pointers of the linked list that contains the ids of freed objects
     * */
    applyObjectFreeing(refs) {
        // write free object head
        let head = this.parser.documentHistory.createObjectLookupTable()[0];
        let last_freed_object_id = head.id;
        let freed_objs = refs.filter(r => r.free);
        freed_objs = freed_objs.sort((a, b) => {
            if (a.id < b.id)
                return -1;
            if (a.id > b.id)
                return 1;
            return 0;
        });
        let lastobj = undefined;
        for (let obj of freed_objs) {
            if (!lastobj) {
                // set first object as list header
                head.pointer = obj.id;
            }
            if (lastobj) {
                lastobj.pointer = obj.id;
            }
            lastobj = obj;
        }
        if (freed_objs.length > 0)
            freed_objs[freed_objs.length - 1].pointer = last_freed_object_id;
        refs.push(head);
        return refs;
    }
    /**
     * Writes the crossite reference table
     * */
    writeCrossSiteReferenceTable() {
        let ret = [...writer_util_1.WriterUtil.XREF];
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        this.xrefs = this.applyObjectFreeing(this.xrefs);
        let ordered_sequences = this.computeXrefSequences();
        for (let sequence of ordered_sequences) {
            let head = sequence[0];
            ret = ret.concat(util_1.Util.convertNumberToCharArray(head.id));
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret = ret.concat(util_1.Util.convertNumberToCharArray(sequence.length));
            ret.push(writer_util_1.WriterUtil.CR);
            ret.push(writer_util_1.WriterUtil.LF);
            for (let i = 0; i < sequence.length; ++i) {
                let _ret = [];
                _ret = _ret.concat(writer_util_1.WriterUtil.pad(10, sequence[i].pointer));
                _ret.push(writer_util_1.WriterUtil.SPACE);
                _ret = _ret.concat(writer_util_1.WriterUtil.pad(5, sequence[i].generation));
                _ret.push(writer_util_1.WriterUtil.SPACE);
                if (sequence[i].free)
                    _ret.push(writer_util_1.WriterUtil.F);
                if (sequence[i].update)
                    _ret.push(writer_util_1.WriterUtil.N);
                _ret.push(writer_util_1.WriterUtil.CR);
                _ret.push(writer_util_1.WriterUtil.LF);
                if (_ret.length < 20)
                    throw Error("XRef entry < 20 bytes");
                ret = ret.concat(_ret);
            }
        }
        return ret;
    }
    /**
     * Writes the trailer
     * */
    writeTrailer(posXref) {
        let ret = [...writer_util_1.WriterUtil.TRAILER];
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.DICT_START);
        ret = ret.concat(writer_util_1.WriterUtil.SIZE);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(util_1.Util.convertNumberToCharArray(this.parser.documentHistory.trailerSize));
        ret.push(writer_util_1.WriterUtil.SPACE);
        if (this.parser.documentHistory.isEncrypted()) {
            ret = ret.concat(writer_util_1.WriterUtil.ENCRYPT);
            ret.push(writer_util_1.WriterUtil.SPACE);
            let enc_ref = this.parser.getCryptoInterface().getEncryptionDictReference();
            if (!enc_ref)
                throw Error("No reference pointer to encryption dictionary");
            ret = ret.concat(writer_util_1.WriterUtil.writeReferencePointer(enc_ref, true));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        let trailer = this.parser.documentHistory.getRecentUpdate();
        if (trailer.id) {
            ret = ret.concat(writer_util_1.WriterUtil.DOCUMENT_ID);
            ret.push(writer_util_1.WriterUtil.SPACE);
            ret.push(writer_util_1.WriterUtil.ARRAY_START);
            for (let val of trailer.id) {
                ret.push(writer_util_1.WriterUtil.SPACE);
                ret = ret.concat(writer_util_1.WriterUtil.HEX_STRING_START);
                ret = ret.concat(util_1.Util.convertStringToAscii(util_1.Util.convertByteArrayToHexString(val)));
                ret = ret.concat(writer_util_1.WriterUtil.HEX_STRING_END);
                ret.push(writer_util_1.WriterUtil.SPACE);
            }
            ret.push(writer_util_1.WriterUtil.ARRAY_END);
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        ret = ret.concat(writer_util_1.WriterUtil.ROOT);
        ret.push(writer_util_1.WriterUtil.SPACE);
        if (!trailer.root)
            throw Error("No root object in trailer, although this is an cross reference table document");
        ret = ret.concat(writer_util_1.WriterUtil.writeReferencePointer(trailer.root, true));
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.PREV);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(util_1.Util.convertNumberToCharArray(this.parser.documentHistory.getRecentUpdate().start_pointer));
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.DICT_END);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.STARTXREF);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(util_1.Util.convertNumberToCharArray(posXref));
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.EOF);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        return ret;
    }
    /**
     * Writes the annations at the end of the PDF byte representation and returns
     * the byte array
     * */
    write() {
        let pageWiseSorted = this.sortPageWise(this.annotations);
        let ptr = this.data.length;
        let new_data = [];
        // Fix case that there is no linebreak after the end of the file
        if (this.data[ptr - 1] === 70) { // 70 = 'F' (from [%%EO]F
            new_data.push(writer_util_1.WriterUtil.CR);
            new_data.push(writer_util_1.WriterUtil.LF);
            ptr += 2;
        }
        for (let key in pageWiseSorted) {
            let pageAnnots = pageWiseSorted[key];
            // write the array referencing to annotations of a certain page
            // it also removes references of annotations that must be deleted
            let annot_array = this.writeAnnotArray(pageAnnots, this.toDelete);
            this.xrefs.push({
                id: annot_array.ptr.obj,
                pointer: ptr,
                generation: annot_array.ptr.generation,
                free: false,
                update: true
            });
            new_data = new_data.concat(annot_array.data);
            ptr += annot_array.data.length;
            // add adapted page object if it exists -- In the case the page had no annotation yet there exists
            // no such array referring to its annotations. A pointer to such an array must be added to the
            // page object. If this was done the `pageData` paramater is set and contains the adapted page object
            if (annot_array.pageData.length > 0) {
                this.xrefs.push({
                    id: annot_array.pageReference.obj,
                    pointer: ptr,
                    generation: annot_array.pageReference.generation,
                    free: false,
                    update: true
                });
                new_data = new_data.concat(annot_array.pageData);
                ptr += annot_array.pageData.length;
            }
            // writes the actual annotation object
            for (let annot of pageAnnots) {
                /**
                 * write additional objects, that are related to the newly created or adapted annotation
                 * */
                for (let add_obj of annot.additional_objects_to_write) {
                    let data = add_obj.func(add_obj.obj, this.cryptoInterface);
                    this.xrefs.push({
                        id: add_obj.obj.object_id.obj,
                        pointer: ptr,
                        generation: add_obj.obj.object_id.generation,
                        free: false,
                        update: true
                    });
                    new_data = new_data.concat(data);
                    ptr += data.length;
                }
                let annot_obj = this.writeAnnotationObject(annot);
                this.xrefs.push({
                    id: annot_obj.ptr.obj,
                    pointer: ptr,
                    generation: annot_obj.ptr.generation,
                    free: false,
                    update: true
                });
                new_data = new_data.concat(annot_obj.data);
                ptr += annot_obj.data.length;
            }
        }
        // take all annotations that are not deleted yet
        let _toDelete = this.toDelete.filter((t) => !t.is_deleted);
        let pageWiseSortedToDelete = this.sortPageWise(_toDelete);
        // adapt the remaining annotation reference tables
        for (let key in pageWiseSortedToDelete) {
            let del_data = this.updatePageAnnotationReferenceArray(pageWiseSortedToDelete[key]);
            this.xrefs.push({
                id: del_data.ptr.obj,
                pointer: ptr,
                generation: del_data.ptr.generation,
                free: false,
                update: true
            });
            new_data = new_data.concat(del_data.data);
            ptr += del_data.data.length;
        }
        // write new fonts
        let fonts = this.parser.getFonts().getFontsToWrite();
        for (let font of fonts) {
            if (!font.object_id)
                throw Error("Font has no object id");
            let font_data = font.writeFont();
            this.xrefs.push({
                id: font.object_id.obj,
                pointer: ptr,
                generation: font.object_id.generation,
                free: false,
                update: true
            });
            new_data = new_data.concat(font_data);
            ptr += font_data.length;
        }
        // at this point all references to annotation objects in pages should be removed and we can free
        // the annotation object ids
        for (let toDel of this.toDelete) {
            if (!toDel.object_id)
                continue;
            this.xrefs.push({
                id: toDel.object_id.obj,
                pointer: -1,
                generation: toDel.object_id.generation + 1,
                free: true,
                update: false
            });
        }
        let crtable = this.writeCrossSiteReferenceTable();
        new_data = new_data.concat(crtable);
        let trailer = this.writeTrailer(ptr);
        new_data = new_data.concat(trailer);
        let new_data_array = new Uint8Array(new_data);
        let ret_array = new Uint8Array(this.data.length + new_data_array.length);
        ret_array.set(this.data);
        ret_array.set(new_data, this.data.length);
        return ret_array;
    }
    /**
     * Removes the given annotation
     * */
    updatePageAnnotationReferenceArray(toDelete) {
        let page = toDelete[0].pageReference;
        if (!page)
            throw Error("Missing page reference");
        if (!page.object_id) {
            throw Error("Page without object id");
        }
        let references = page.annots;
        // remove annotation references from the array that must be deleted and mark them as deleted
        references = references.filter((a) => {
            let toDel = toDelete.find((t) => t.object_id.obj === a.obj && t.object_id.generation === a.generation);
            if (toDel) {
                toDel.is_deleted = true;
                return false;
            }
            return true;
        });
        let refArray_id = page.annotsPointer;
        let ret = writer_util_1.WriterUtil.writeReferencePointer(refArray_id);
        ret.push(writer_util_1.WriterUtil.SPACE);
        ret = ret.concat(writer_util_1.WriterUtil.OBJ);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret.push(writer_util_1.WriterUtil.ARRAY_START);
        for (let an of references) {
            ret = ret.concat(writer_util_1.WriterUtil.writeReferencePointer(an, true));
            ret.push(writer_util_1.WriterUtil.SPACE);
        }
        ret.push(writer_util_1.WriterUtil.ARRAY_END);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        ret = ret.concat(writer_util_1.WriterUtil.ENDOBJ);
        ret.push(writer_util_1.WriterUtil.CR);
        ret.push(writer_util_1.WriterUtil.LF);
        return { ptr: refArray_id, data: ret };
    }
}
exports.Writer = Writer;
//# sourceMappingURL=writer.js.map
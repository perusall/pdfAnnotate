import { ReferencePointer } from './parser';
export interface ResourceDef {
    name: string;
    refPtr?: ReferencePointer | undefined;
}
export declare class Resource {
    object_id: ReferencePointer | undefined;
    new_object: boolean;
    /**
     * Hoelds the reference pointer of the object to which the resource dictionary is related
     * */
    associatedWith: ReferencePointer | undefined;
    extGState: ResourceDef[];
    colorSpace: ResourceDef[];
    pattern: ResourceDef[];
    shading: ResourceDef[];
    xObject: ResourceDef[];
    font: ResourceDef[];
    procSet: ResourceDef[];
    properties: ResourceDef[];
    constructor();
    private containsResourceDef;
    addGStateDef(def: ResourceDef): void;
    addColorSpaceDef(def: ResourceDef): void;
    addPatternDef(def: ResourceDef): void;
    addShadingDef(def: ResourceDef): void;
    addXObjectDef(def: ResourceDef): void;
    addFontDef(def: ResourceDef): void;
    addProcSetDef(def: ResourceDef): void;
    addProperty(def: ResourceDef): void;
    private writeDictAttribute;
    private writeArrayAttribute;
    writeResource(): number[];
    /**
     * Extract the resource mappings from a dictionary
     * */
    extract(value: any): void;
}

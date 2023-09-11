import { ReferencePointer, CryptoInterface } from './parser';
export interface FilterParameters {
    predictor: number;
    columns: number;
    encoding?: number | undefined;
}
export declare class Stream {
    protected data: Uint8Array;
    private _ptr;
    constructor(data: Uint8Array);
    getData(): Uint8Array;
    /**
     * Returns the data encoded
     * */
    encode(): Uint8Array;
    getLength(): number;
    peekNBytes(n?: number, ptr?: number): Uint8Array;
    peekNBytesAsNumber(n?: number, ptr?: number): number;
    /**
     * reads the next 'n' bytes of position 'ptr' and returns its content as a number
     * */
    getNBytesAsNumber(n?: number): number;
    /**
     * Reads the next byte from the stream
     * */
    getByte(): number;
    /**
     * Skips spaces and than adds as many bytes to the number until another space is reached
     * */
    getNumber(): number;
}
export declare class FlateStream extends Stream {
    protected data: Uint8Array;
    private decodeParameters;
    private rawData;
    private cryptoInterface;
    private object_id;
    /**
     * rawData : if true, the provided data is not compressed yet.
     * */
    constructor(data: Uint8Array, decodeParameters?: FilterParameters | undefined, rawData?: boolean, cryptoInterface?: CryptoInterface | undefined, object_id?: ReferencePointer | undefined);
    /**
     * Returns the data encoded
     * */
    encode(): Uint8Array;
    private applyEncoding;
    private applyDecoding;
    /**
     * Applies PNG filter for encoding the data stream
     * */
    encodePNGFilter(data: Uint8Array, decodeParameters: FilterParameters): Uint8Array;
    /**
     * Applies PNG Filter for decoding the data stream
     * */
    decodePNGFilter(data: Uint8Array, decodeParameters: FilterParameters): Uint8Array;
    /**
     * Computes the path predictor of the given bytes
     * */
    private paethPredictor;
}

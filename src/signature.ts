import { G1Point } from './g1point';

export class Signature {

    p: G1Point;

    constructor(p: G1Point) {
        this.p = p;
    }

    public toBuffer(): Buffer {
        return this.p.toBuffer();
    }

    static fromBuffer(buf: Buffer): Signature {
        const p = G1Point.fromBuffer(buf);
        return new this(p);
    }
}

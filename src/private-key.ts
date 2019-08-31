import { BIG } from './ctx';
import { G1Point } from './g1point';
import { Signature } from './signature';
import { maskedBigFromArray } from './util';

type BIG = typeof BIG;

export class PrivateKey {

    readonly s: BIG;

    constructor(s: BIG) {
        this.s = s;
    }

    sign(message): Signature {
        const hm = G1Point.fromHash(message);
        const sig = G1Point.scalarMult(this.s, hm);
        return new Signature(sig);
    }

    static fromBuffer(buf: Buffer): PrivateKey {
        const s = maskedBigFromArray(buf);
        return new this(s);
    }
}

import * as secureRandom from 'secure-random';
import { Scalar} from './scalar';
import { G1Point } from './g1point';
import { Signature } from './signature';
import { maskedBigFromArray } from './util';

export class PrivateKey {

    s: Scalar;

    constructor(s: Scalar) {
        this.s = s;
    }

    sign(message): Signature {
        const hm = G1Point.fromHash(message);
        const sig = G1Point.scalarMult(this.s, hm);
        return new Signature(sig);
    }

    toBuffer(): Buffer {
        return this.s.toBuffer();
    }

    static fromSeed(buf: Buffer): PrivateKey {
        const b = maskedBigFromArray(buf);
        const s = new Scalar(b);
        return new this(s);
    }

    static fromBuffer(buf: Buffer): PrivateKey {
        const s = Scalar.fromBuffer(buf);
        return new this(s);
    }

    static random(): PrivateKey {
        const sk = secureRandom(32, {type: 'Buffer'});
        return PrivateKey.fromSeed(sk);
    }
}

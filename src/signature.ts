import { G1Point } from './g1point';
import { Scalar} from './scalar';

export class Signature {

    p: G1Point;

    constructor(p: G1Point) {
        this.p = p;
    }

    mul(e: Scalar): Signature {
        this.p = G1Point.scalarMult(e, this.p);
        return this;
    }

    static copy(from: Signature): Signature {
        return new Signature(from.p);
    }

    add(x: Signature): Signature {
        this.p.add(x.p);
        return this;
    }

    public toBuffer(): Buffer {
        return this.p.toBuffer();
    }

    static fromBuffer(buf: Buffer): Signature {
        const p = G1Point.fromBuffer(buf);
        return new this(p);
    }

    static add(x: Signature[]): Signature {
        const s = G1Point.copy(x[0].p);
        for (let t of x.slice(1)) {
            s.add(t.p);
        }
        return new Signature(s);
    }
}

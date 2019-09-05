import * as reverse from 'buffer-reverse';
import { BIG, ECP2, FP2 } from '@futuretense/milagro-crypto-js';

export class G2Point {

    p: ECP2;

    constructor(p: ECP2) {
        this.p = p;
    }

    toBuffer(): Buffer {
        this.p.affine();
        const a = Buffer.alloc(32);
        const b = Buffer.alloc(32);
        this.p.x.a.redc().toBytes(a);
        this.p.x.b.redc().toBytes(b);

        const yIsOdd = this.p.y.a.redc().lastbits(1);
        b[0] |= yIsOdd << 7;

        return reverse(Buffer.concat([b, a]));
    }

    static fromBuffer(buf: Buffer): G2Point {

        const buf2 = reverse(buf);
        const yIsOdd = buf2[0] >> 7;
        buf2[0] &= 0x7f;

        const b = BIG.frombytearray(buf2, 0);
        const a = BIG.frombytearray(buf2, 32);
        const x = new FP2(a, b);
        const y = getYFromX(x, yIsOdd);

        const P = new ECP2();
        P.x = x;
        P.y = y;
        P.z.one();
        return new this(P);
    }

    static scalarMult(scalar: BIG, point: G2Point): G2Point {
        return new this(PAIR.G2mul(point.p, scalar));
    }
}

function getYFromX(x: FP2, yIsOdd: number): FP2 {
    let y = getWeierstrass(x);

    const ok = y.sqrt();
    if (!ok) {
        throw {};
    }

    const yIsOdd2 = y.a.redc().lastbits(1);
    if (yIsOdd2 !== yIsOdd) {
        y.neg();
    }

    return y;
}

function getWeierstrass(x: FP2): FP2 {
    let t = new FP2(x);
    t.sqr();
    t.mul(x);
    t.add(curveB);
    return t;
}

const curveB = new FP2(1, -1);
const G = ECP2.fromBytes(Buffer.from('11ccb44e77ac2c5dc32a6009594dbe331ec85a61290d6bbac8cc7ebb2dceb1280f204a14bbdac4a05be9a25176de827f2e60085668becdd4fc5fa914c9ee0d9a07c13d8487903ee3c1c5ea327a3a52b6cc74796b1760d5ba20ed802624ed19c8008f9642bbaacb73d8c89492528f58932f2de9ac3e80c7b0e41f1a84f1c40182', 'hex'));

export namespace G2Point {
    export const generator = new G2Point(G);
}

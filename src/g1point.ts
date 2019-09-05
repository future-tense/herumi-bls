import { sha256 } from 'js-sha256';
import * as reverse from 'buffer-reverse';
import { BIG, ECP, FP } from '@futuretense/milagro-crypto-js';
import { maskedBigFromArray } from './util';

export class G1Point {

    p: ECP;

    constructor(p: ECP) {
        this.p = p;
    }

    static scalarMult(scalar: BIG, point: G1Point): G1Point {
        return new this(PAIR.G1mul(point.p, scalar));
    }

    toBuffer(): Buffer {
        const yIsOdd = this.p.y.isodd();
        const buf2 = Buffer.alloc(32);
        this.p.x.redc().toBytes(buf2);
        buf2[0] |= Number(yIsOdd) << 7;
        return reverse(buf2);
    }

    static fromBuffer(buf: Buffer): G1Point {
        const buf2 = reverse(buf);
        const yIsOdd = buf2[0] > 127;
        buf2[0] &= 0x7f;

        const a = BIG.fromBytes(buf2);
        const x = new FP(a);
        const y = getYFromX(x, yIsOdd);

        const P = new ECP();
        P.x = x;
        P.y = y;
        P.z.one();
        return new this(P);
    }

    static fromHash(message): G1Point {
        return new this(hashAndMapToG1(message));
    }
}

function getYFromX(x: FP, yIsOdd: boolean): FP {
    let y = getWeierstrass(x);
    if (y.jacobi() < 0) {
        throw {};
    }

    y = y.sqrt();
    if (y.isodd() !== yIsOdd) {
        y = y.neg();
    }

    return y;
}

function getWeierstrass(x) {
    return new FP(x).sqr().mul(x).add(curveB);
}

function hashAndMapToG1(message): ECP {
    const hash = sha256.array(message);
    const s = maskedBigFromArray(hash);
    const t = new FP(s);
    const negative = t.jacobi() < 0;
    const w = new FP(t)
        .sqr()
        .add(curveB)
        .add(fpOne)
        .inverse()
        .mul(C1)
        .mul(t);

    let x;
    for (let i = 0; i < 3; i++) {
        switch (i) {
            case 0:
                x = t.mul(w)
                    .neg()
                    .add(C2);
                break;
            case 1:
                x = x.neg()
                    .sub(fpOne);
                break;
            case 2:
                x = w.sqr()
                    .inverse()
                    .add(fpOne);
                break
        }

        let y = getWeierstrass(x);
        if (y.jacobi() >= 0) {
            y = y.sqrt();
            if (negative) {
                y = y.neg();
            }

            const P = new ECP();
            P.x = x;
            P.y = y;
            P.z.one();
            return P;
        }
    }
}

const fpOne = new FP(1);
const curveB = new FP(2);
const C1 = new FP(BIG.fromBytes(Buffer.from('252364824000000126cd890000000003cf0f0000000000060c00000000000004', 'hex')));
const C2 = new FP(BIG.fromBytes(Buffer.from('25236482400000017080eb4000000006181800000000000cd98000000000000b', 'hex')));


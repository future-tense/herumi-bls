import { G2Point } from './g2point';
import { G1Point } from './g1point';
import { pairing } from './pairing';
import { PrivateKey } from './private-key';
import { Signature } from './signature';

export class PublicKey {

    readonly p: G2Point;

    constructor(p: G2Point) {
        this.p = p;
    }

    toBuffer(): Buffer {
        return this.p.toBuffer();
    }

    verify(
        message,
        signature: Signature
    ): boolean {
        const hm = G1Point.fromHash(message);
        const e1 = pairing(this.p, hm);
        const e2 = pairing(G2Point.generator, signature.p);
        return e1.equals(e2);
    }

    static fromPrivateKey(pk: PrivateKey): PublicKey {
        const p = G2Point.scalarMult(pk.s, G2Point.generator);
        return new PublicKey(p);
    }

    static fromBuffer(buf: Buffer) {
        const p = G2Point.fromBuffer(buf);
        return new PublicKey(p);
    }
}

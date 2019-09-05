import { BIG } from '@futuretense/milagro-crypto-js';
import * as reverse from 'buffer-reverse';

export class Scalar {

    s: BIG;

    constructor(s: BIG | number) {
        if (typeof s === "number") {
            this.s = new BIG(s)
        } else {
            this.s = s;
        }
    }

    invert(): Scalar {
        this.s.invmodp(Scalar.order);
        return this;
    }

    toBuffer(): Buffer {
        const a = Buffer.alloc(32);
        this.s.mod(Scalar.order).toBytes(a);
        return reverse(a);
    }

    static copy(from: Scalar): Scalar {
        return new Scalar(from.s);
    }

    add(x: Scalar): Scalar {
        this.s.add(x.s);
        return this;
    }

    static fromBuffer(buf: Buffer): Scalar {
        const s = BIG.fromBytes(reverse(buf));
        return new this(s);
    }
}

export namespace Scalar {
    export const order = BIG.fromBytes(Buffer.from('2523648240000001ba344d8000000007ff9f800000000010a10000000000000d', 'hex'));
}

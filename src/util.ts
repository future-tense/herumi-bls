import * as reverse from 'buffer-reverse';
import { BIG } from './ctx';

type BIG = typeof BIG;

export function maskedBigFromArray(
    x: Buffer | number[]
): BIG {
    const t = reverse(x);
    t[0] &= 0x1f;
    return BIG.fromBytes(t);
}

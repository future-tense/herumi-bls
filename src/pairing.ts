import { FP12, PAIR } from '@futuretense/milagro-crypto-js';
import { G2Point } from './g2point';
import { G1Point } from './g1point';

type Pairing = FP12;

export function pairing(
    x: G2Point,
    y: G1Point
): Pairing {
    return PAIR.fexp(PAIR.ate(x.p, y.p));
}

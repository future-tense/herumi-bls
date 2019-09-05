import * as secureRandom from 'secure-random';
import { Scalar} from './scalar';

export function generatePolynomial(
    x: Scalar,
    threshold: number
): Scalar[] {

    const poly: Scalar[] = [];

    threshold -= 1;
    for (let i = 0; i < threshold; i++) {
        const buf = secureRandom(32, {type: 'Buffer'});
        const s = Scalar.fromBuffer(buf);
        s.s.mod(Scalar.order);
        poly.push(s);
    }
    poly.push(x);

    return poly;
}

export function evaluateRange(
    poly: Scalar[],
    start: number,
    end: number
): Scalar[] {
    return evaluateRangeRegular(poly, start, end);
}

function evaluateRangeRegular(
    poly: Scalar[],
    start: number,
    end: number
): Scalar[] {

    const result: Scalar[] = [];
    for (let x = start; x <= end; x++) {
        result.push(evaluate(poly, x));
    }
    return result;
}

function evaluate(
    poly: Scalar[],
    x: number
): Scalar {

    let s = new Scalar(0);
    for (let coeff of poly) {
        const t = s.s.pxmul(x).mod(Scalar.order).add(coeff.s).mod(Scalar.order);
        s = new Scalar(t);
    }

    return s;
}

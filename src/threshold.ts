import { PrivateKey } from './private-key';
import { Signature } from './signature';
import { Scalar} from './scalar';
import { generatePolynomial, evaluateRange } from './poly';

/**
 * Splits a private key into `numShard` pieces in a way that
 * requires at least `threshold` pieces to reconstruct
 *
 * @param pk
 * @param threshold
 * @param numShards
 */
export function splitKey(
    pk: PrivateKey,
    threshold: number,
    numShards: number
): PrivateKey[] {
    const shards = generateZeta(pk.s, threshold, numShards);
    return shards.map((shard) => new PrivateKey(shard));
}

export function aggregateSignatures(
    sigs: Signature[],
    shards: number[]
): Signature {

    if (sigs.length !== shards.length) {
        throw {};
    }

    const lambda = getLambda(0, shards);
    const s = Signature.copy(sigs[0].mul(lambda));
    for (let i = 1; i < sigs.length; i++) {
        const lambda = getLambda(i, shards);
        s.add(sigs[i].mul(lambda));
    }

    return s;
}

/**
 * @param index
 * @param shards
 */

export function getLambda(
    index: number,
    shards: number[]
): Scalar {

    const [numerator, denominator] = diffProd(index, shards);
    const invD = new Scalar(denominator).invert();

    if (numerator < 0) {
        return new Scalar(invD.s.pxmul(-numerator).mod(Scalar.order).rsub(Scalar.order));
    } else {
        return new Scalar(invD.s.pxmul(numerator).mod(Scalar.order));
    }
}

/**
 *
 * @param x
 * @param threshold
 * @param numShards
 */

function generateZeta(
    x: Scalar,
    threshold: number,
    numShards: number
): Scalar[] {
    const p = generatePolynomial(x, threshold);
    return evaluateRange(p, 1, numShards);
}

function diffProd(
    index: number,
    array: number[]
): [number, number] {

    let num = 1;
    let den = 1;
    for (let coeff of array) {
        if (coeff !== index) {
            num *= 0 - coeff - 1;
            den *= index - coeff;
        }
    }

    if (den < 0) {
        return [-num, -den];
    } else {
        return [num, den];
    }
}


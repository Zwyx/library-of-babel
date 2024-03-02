import {
	BASE_10_ALPHABET,
	BASE_10_BIGINT,
	BASE_16_ALPHABET,
	BASE_16_BIGINT,
	BASE_29_ALPHABET,
	BASE_29_BIGINT,
	BASE_94_ALPHABET,
	BASE_94_BIGINT,
} from "@/lib/common";
import { lg } from "@/lib/utils";

// Could be used in `toBase` to get the number of bits of the `value` argument,
// but because we have to do `value.toString(2)`, it isn't more performant
// than just doing `value.toString(2).length`
// const log2 = (value: bigint): number => {
// 	if (value < 0) {
// 		return NaN;
// 	}
//
// 	const binary = value.toString(2);
//
// 	// https://stackoverflow.com/questions/70382306/logarithm-of-a-bigint
// 	return binary.length + Math.log10(Number("0." + binary.substring(0, 15)));
// };

export const toBase = (
	value: bigint,
	base: bigint,
	alphabet: string,
): string => {
	const startTime = Date.now();

	let result = "";

	// Successive divisions method; 30s for a bigint made of 500,000 random digits in base 10
	// let dividend = value;
	// let remainder;
	// while (dividend >= base) {
	// 	remainder = dividend % base;
	// 	result = alphabet[Number(remainder)] + result;
	// 	dividend = dividend / base;
	// }
	// result = alphabet[Number(dividend)] + result;

	// "Intermediate base 9" method, allowing to reach base 81; 80ms for a bigint made of 500,000 random digits in base 10
	// const base9Text = `0${value.toString(9)}`;
	// for (let i = base9Text.length - 2; i >= 0; i -= 2) {
	// 	result = `${
	// 		alphabet[parseInt(base9Text.slice(i, i + 2), 9)]
	// 	}${result}`;
	// }

	// "Divide-and-conquer" algorithm, taken from V8's source code; 180s for a bigint made of 500,000 random digits in base 10
	// https://github.com/v8/v8/blob/main/src/bigint/tostring.cc
	// https://zwyx.dev/blog/base-conversions-with-big-numbers-in-javascript

	const divisors = [base];
	const valueBinaryLength = value.toString(2).length;

	while (
		divisors[divisors.length - 1].toString(2).length * 2 - 1 <=
		valueBinaryLength
	) {
		divisors.push(divisors[divisors.length - 1] ** 2n);
	}

	const devide = (dividend: bigint, divisorIndex: number) => {
		const divisor = divisors[divisorIndex];

		const remainder = dividend % divisor;
		const newDividend = dividend / divisor;

		if (divisorIndex > 0) {
			devide(remainder, divisorIndex - 1);
			devide(newDividend, divisorIndex - 1);
		} else {
			result = `${alphabet[Number(newDividend)]}${
				alphabet[Number(remainder)]
			}${result}`;
		}
	};

	devide(value, divisors.length - 1);

	result = result.replace(new RegExp(`^${alphabet[0]}*`), "");

	lg(`'toBase' took ${Date.now() - startTime}ms`);

	return result;
};

export const fromBase = (
	text: string,
	base: bigint,
	alphabet: string,
): bigint => {
	const startTime = Date.now();

	// let result = 0n;
	//
	// Successive multiplications method; 30s for 500,000 random digits from base 10, compared to 100ms for BigInt
	// for (let i = 0; i < text.length; i++) {
	// 	result = result * base + BigInt(alphabet.indexOf(text.charAt(i)));
	// }
	//
	// Digit power method; much slower that successive multiplications
	// for (let i = text.length - 1; i >= 0; i--) {
	// 	result +=
	// 		BigInt(alphabet.indexOf(text.charAt(i))) *
	// 		base ** BigInt(text.length - 1 - i);
	// }
	//
	// Multiplier increase method; also slow
	// let multiplier = 1n;
	// for (let i = text.length - 1; i >= 0; i--) {
	// 	result += BigInt(alphabet.indexOf(text.charAt(i))) * multiplier;
	// 	multiplier *= base;
	// }
	// return result;

	// Pairing algorithm, taken from V8's source code; 120ms for 500,000 random digits from base 10,
	// just slightly slower than native BigInt
	// https://github.com/v8/v8/blob/main/src/bigint/fromstring.cc
	// https://zwyx.dev/blog/base-conversions-with-big-numbers-in-javascript

	let parts = (text || " ")
		.split("")
		.map((part) => [BigInt(alphabet.indexOf(part)), base]);

	if (parts.length === 1) {
		return parts[0][0];
	}

	let pairFull: boolean;

	while (parts.length > 2) {
		pairFull = false;
		parts = parts.reduce<bigint[][]>((acc, cur, i) => {
			if (!pairFull) {
				if (i === parts.length - 1) {
					acc.push(cur);
				} else {
					acc.push([
						cur[0] * parts[i + 1][1] + parts[i + 1][0],
						cur[1] * parts[i + 1][1],
					]);
					pairFull = true;
				}
			} else {
				pairFull = false;
			}
			return acc;
		}, []);
	}

	const result = parts[0][0] * parts[1][1] + parts[1][0];

	lg(`'fromBase' took ${Date.now() - startTime}ms`);

	return result;
};

export const toBase10 = (value: bigint) =>
	toBase(value, BASE_10_BIGINT, BASE_10_ALPHABET);

export const toBase29 = (value: bigint) =>
	toBase(value, BASE_29_BIGINT, BASE_29_ALPHABET);

export const toBase94 = (value: bigint) =>
	toBase(value, BASE_94_BIGINT, BASE_94_ALPHABET);

export const fromBase16 = (text: string) =>
	fromBase(text, BASE_16_BIGINT, BASE_16_ALPHABET);

export const fromBase29 = (text: string) =>
	fromBase(text, BASE_29_BIGINT, BASE_29_ALPHABET);

export const fromBase94 = (text: string) =>
	fromBase(text, BASE_94_BIGINT, BASE_94_ALPHABET);

import {
	BASE_10_ALPHABET,
	BASE_10_BIGINT,
	BASE_29_ALPHABET,
	BASE_29_BIGINT,
	BASE_94_ALPHABET,
	BASE_94_BIGINT,
} from "@/lib/common";
import { lg } from "@/lib/utils";

const fromBase = (text: string, base: bigint, alphabet: string): bigint => {
	const startTime = performance.now();

	// Successive multiplications method; 30s for 500,000 random digits from base 10, compared to 100ms for BigInt
	//
	// let result = 0n;
	// for (let i = 0; i < text.length; i++) {
	// 	result = result * base + BigInt(alphabet.indexOf(text.charAt(i)));
	// }

	// Digit power method; much slower that successive multiplications
	//
	// let result = 0n;
	// for (let i = text.length - 1; i >= 0; i--) {
	// 	result +=
	// 		BigInt(alphabet.indexOf(text.charAt(i))) *
	// 		base ** BigInt(text.length - 1 - i);
	// }

	// Multiplier increase method; also slow
	//
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

	const value = parts[0][0] * parts[1][1] + parts[1][0];

	lg(`'fromBase${base}' took ${performance.now() - startTime} ms`);

	return value;
};

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

const toBase = (value: bigint, base: bigint, alphabet: string): string => {
	const startTime = performance.now();

	let text = "";

	// Successive divisions method; 30s for a bigint made of 500,000 random digits in base 10
	//
	// let dividend = value;
	// let remainder;
	// while (dividend >= base) {
	// 	remainder = dividend % base;
	// 	result = alphabet[Number(remainder)] + result;
	// 	dividend = dividend / base;
	// }
	// result = alphabet[Number(dividend)] + result;

	// "Intermediate base 9" method, allowing to reach base 81; 80ms for a bigint made of 500,000 random digits in base 10
	//
	// const base9Text = `0${value.toString(9)}`;
	// for (let i = base9Text.length - 2; i >= 0; i -= 2) {
	// 	result = `${
	// 		alphabet[parseInt(base9Text.slice(i, i + 2), 9)]
	// 	}${result}`;
	// }

	// "Divide-and-conquer" algorithm, taken from V8's source code; 150ms for a bigint made of 500,000 random digits in base 10
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

	const divide = (dividend: bigint, divisorIndex: number) => {
		const divisor = divisors[divisorIndex];

		const remainder = dividend % divisor;
		const newDividend = dividend / divisor;

		if (divisorIndex > 0) {
			divide(remainder, divisorIndex - 1);
			divide(newDividend, divisorIndex - 1);
		} else {
			text = `${alphabet[Number(newDividend)]}${
				alphabet[Number(remainder)]
			}${text}`;
		}
	};

	divide(value, divisors.length - 1);

	text = text.replace(new RegExp(`^${alphabet[0]}*`), "");

	lg(`'toBase${base}' took ${performance.now() - startTime} ms`);

	return text;
};

export const fromBase10 = (text: string): bigint => {
	// Comparisons made with a bigint with ~313,530 digits in base 10 (a book with 67 pages)

	// Chrome:                     52 ms
	// Chrome Android (Pixel 4a): 302 ms
	// return fromBase(text, BASE_10_BIGINT, BASE_10_ALPHABET);

	// Chrome:                    14 ms
	// Chrome Android (Pixel 4a): 83 ms
	return BigInt(text);
};

export const fromBase16 = (text: string): bigint => {
	// Comparisons made with the "Open an image" feature,
	// giving a bigint with ~1,900,000 digits in base 10

	// Chrome:                     343 ms
	// Chrome Android (Pixel 4a): 1307 ms
	// return fromBase(text, BASE_16_BIGINT, BASE_16_ALPHABET);

	// Chrome:                    2.3 ms
	// Chrome Android (Pixel 4a): 5.6 ms
	return BigInt(`0x${text}`);
};

export const fromBase29 = (text: string): bigint =>
	fromBase(text, BASE_29_BIGINT, BASE_29_ALPHABET);

export const fromBase94 = (text: string): bigint =>
	fromBase(text, BASE_94_BIGINT, BASE_94_ALPHABET);

export const toBase10 = (value: bigint): string => {
	// Comparisons made with a bigint with ~313,530 digits in base 10 (a book with 67 pages)

	// Chrome:                    123 ms
	// Chrome Android (Pixel 4a): 434 ms
	return toBase(value, BASE_10_BIGINT, BASE_10_ALPHABET);

	// Chrome:                     49 ms
	// Chrome Android (Pixel 4a): 4.5 s ← /!\ /!\ /!\
	// Chrome on Android is much slower; this is probably explained by the fact that
	// the fast BigInt algorithms are behind a feature flag, `V8_ADVANCED_BIGINT_ALGORITHMS`,
	// which must be ON for building Chrome Desktop, but OFF for building Chrome Android.
	// For this reason, we'll use our own `toBase` method for now, instead of the native one.
	// return value.toString();
};

export const toBase16 = (value: bigint): string => {
	// Comparisons made with a bigint with ~313,530 digits in base 10 (a book with 67 pages)

	// Chrome:                     40 ms
	// Chrome Android (Pixel 4a): 134 ms
	// return toBase(value, BASE_16_BIGINT, BASE_16_ALPHABET);

	// Chrome:                    0.2 ms
	// Chrome Android (Pixel 4a): 0.4 ms
	return value.toString(16);
};

export const toBase29 = (value: bigint): string =>
	toBase(value, BASE_29_BIGINT, BASE_29_ALPHABET);

export const toBase94 = (value: bigint): string =>
	toBase(value, BASE_94_BIGINT, BASE_94_ALPHABET);

export const fromUint8Array = (array: Uint8Array): bigint => {
	const startTime = performance.now();

	// Comparisons made with a bigint with ~313,530 digits in base 10 (a book with 67 pages
	// the max possible in Firefox, see `AboutDialog.tsx` section "Browsers limitations")

	// Pairing algorithm, see `fromBase` above.
	// Chrome:                     30 ms
	// Chrome Android (Pixel 4a): 100 ms
	// Firefox:                   100 ms
	//
	// let parts: bigint[][] = new Array(array.length);
	//
	// array.forEach((part, i) => {
	// 	parts[i] = [BigInt(part), 256n];
	// });
	//
	// if (parts.length === 1) {
	// 	return parts[0][0];
	// }
	//
	// let pairFull: boolean;
	//
	// while (parts.length > 2) {
	// 	pairFull = false;
	// 	parts = parts.reduce<bigint[][]>((acc, cur, i) => {
	// 		if (!pairFull) {
	// 			if (i === parts.length - 1) {
	// 				acc.push(cur);
	// 			} else {
	// 				acc.push([
	// 					cur[0] * parts[i + 1][1] + parts[i + 1][0],
	// 					cur[1] * parts[i + 1][1],
	// 				]);
	// 				pairFull = true;
	// 			}
	// 		} else {
	// 			pairFull = false;
	// 		}
	// 		return acc;
	// 	}, []);
	// }
	//
	// const value = parts[0][0] * parts[1][1] + parts[1][0];

	let valueString16: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- `Uint8Array.prototype.toHex()` isn't known by TypeScript yet, see https://github.com/microsoft/TypeScript/pull/61696
	if ((array as any).toHex) {
		// Native method with `Uint8Array.prototype.toHex` (Chrome 140+)
		// Chrome Android (Pixel 4a): 1 ms
		// Firefox:                   1 ms

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- See above
		valueString16 = (array as any).toHex();
	} else {
		// "Intermedia base 16" method
		// Chrome:                     5 ms
		// Chrome Android (Pixel 4a): 22 ms
		// Firefox:                    3 ms

		valueString16 = "";

		for (let i = 0; i < array.length; i++) {
			const n = array[i].toString(16);
			valueString16 += (n.length === 1 ? "0" : "") + n;
		}
	}

	const value = fromBase16(valueString16);

	lg(`'fromUint8Array' took ${performance.now() - startTime} ms`);

	return value;
};

export const toUint8Array = (value: bigint): Uint8Array => {
	const startTime = performance.now();

	let array: Uint8Array;

	// Comparisons made with a bigint with ~313,530 digits in base 10 (a book with 67 pages
	// the max possible in Firefox, see `AboutDialog.tsx` section "Browsers limitations")

	// "Divide-and-conquer" algorithm, see `toBase` above.
	// Chrome:          25 ms
	// Chrome Android:  72 ms
	// Firefox:        950 ms
	//
	// const length = Math.ceil(value.toString(16).length / 2);
	//
	// result = new Uint8Array(length);
	// let resultIndex = length - 1;
	//
	// const divisors = [256n];
	// const valueBinaryLength = value.toString(2).length;
	//
	// while (
	// 	divisors[divisors.length - 1].toString(2).length * 2 - 1 <=
	// 	valueBinaryLength
	// ) {
	// 	divisors.push(divisors[divisors.length - 1] ** 2n);
	// }
	//
	// const divide = (dividend: bigint, divisorIndex: number) => {
	// 	const divisor = divisors[divisorIndex];
	//
	// 	const remainder = dividend % divisor;
	// 	const newDividend = dividend / divisor;
	//
	// 	if (divisorIndex > 0) {
	// 		divide(remainder, divisorIndex - 1);
	// 		divide(newDividend, divisorIndex - 1);
	// 	} else {
	// 		// At the end, `resultIndex` will be negative and both `remainder` and `newDividend` will be `0`,
	// 		// we could test and return, but it hurts performance;
	// 		// it is the equivalent of the `result.replace(new RegExp(`^${alphabet[0]}*`), "")` we do in `toBase`.
	// 		result[resultIndex--] = Number(remainder);
	// 		result[resultIndex--] = Number(newDividend);
	// 	}
	// };
	//
	// divide(value, divisors.length - 1);

	let valueString16 = toBase16(value);

	if (valueString16.length % 2 !== 0) {
		valueString16 = `0${valueString16}`;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- `Uint8Array.fromHex()` isn't known by TypeScript yet, see https://github.com/microsoft/TypeScript/pull/61696
	if ((Uint8Array as any).fromHex) {
		// Native method with `Uint8Array.fromHex` (Chrome 140+)
		// Chrome Android (Pixel 4a): 0.6 ms
		// Firefox:                   1   ms (or less, as 1 ms is the smallest unit in Firefox)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- See above
		array = (Uint8Array as any).fromHex(valueString16);
	} else {
		// "Intermedia base 16" method
		// Chrome:                      5 ms
		// Chrome Android (Pixel 4a):  16 ms
		// Firefox:                     5 ms

		const length = Math.ceil(valueString16.length / 2);

		array = new Uint8Array(length);

		for (let i = length - 1; i >= 0; i--) {
			// Not padding the left of `valueString16` with one `0`, and instead record
			// if the length is even or odd (`const odd = valueString16.length % 2 !== 0;`)
			// and then here, do:
			// ```
			// if (i === 0 && odd) {
			// 	result[i] = parseInt(valueString16.charAt(0), 16);
			// } else {
			// 	result[i] =
			// 		(parseInt(valueString16.charAt(i * 2 - (odd ? 1 : 0)), 16) << 4) +
			// 		parseInt(valueString16.charAt(i * 2 + (odd ? 0 : 1)), 16);
			// }
			// ```
			// didn't lead to any performance improvement.
			array[i] =
				(parseInt(valueString16.charAt(i * 2), 16) << 4) +
				parseInt(valueString16.charAt(i * 2 + 1), 16);
		}
	}

	lg(`'toUint8Array' took ${performance.now() - startTime} ms`);

	return array;
};

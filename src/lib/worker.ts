import { Book, Page } from "@/components/BookPage";
import { lg } from "./utils";

export const BOOK_LENGTH = 1312000;
export const PAGE_LENGTH = 3200;
export const LINE_LENGTH = 80;

export const BASE_29 = 29;
export const BASE_29_BIGINT = 29n;
export const BASE_29_BIGINT_ALPHABET = "0123456789abcdefghijklmnopqrs";
export const BASE_29_BOOK_ALPHABET = " abcdefghijklmnopqrstuvwxyz,.";

export const BASE_81_BIGINT = 81n;
export const BASE_81_ALPHABET =
	"!#$%&*+,-/0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz|~";

const toBase29 = (value: bigint): string => {
	const time = Date.now();

	const result = value.toString(BASE_29);

	lg(`'toBase29' took ${Date.now() - time}ms`);

	return result;
};

const toBase81 = (value: bigint): string => {
	const time = Date.now();

	let result = "";

	// Successive divisions method
	// let dividend = value;
	// let remainder;
	// while (dividend >= BASE_81) {
	// 	remainder = dividend % BASE_81;
	// 	result = BASE_81_ALPHABET[Number(remainder)] + result;
	// 	dividend = dividend / BASE_81;
	// }
	// result = BASE_81_ALPHABET[Number(dividend)] + result;

	// "Intermediate base 9" method; about ten times faster than successive divisions!
	const base9Text = `0${value.toString(9)}`;
	for (let i = base9Text.length - 2; i >= 0; i -= 2) {
		result = `${
			BASE_81_ALPHABET[parseInt(base9Text.slice(i, i + 2), 9)]
		}${result}`;
	}

	lg(`'toBase81' took ${Date.now() - time}ms`);

	return result;
};

const fromBase = (text: string, base: bigint, alphabet: string): bigint => {
	const time = Date.now();

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

	// Pairing algorithm, taken from V8's source code; 120ms for 500,000 random digits from base 10, just slightly slower than BigInt
	// https://github.com/v8/v8/blob/main/src/bigint/fromstring.cc
	// https://zwyx.dev/til/2023/12/31/Fast%20string-to-integer%20conversion
	let parts = text
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

	lg(`'fromBase' took ${Date.now() - time}ms`);

	return result;
};

const fromBase29Book = (pages: Page[]) => {
	const time = Date.now();

	const result = fromBase(
		pages
			.reverse()
			.map(({ lines }) =>
				lines
					.reverse()
					.map(({ chars }) => chars.split("").reverse().join(""))
					.join(""),
			)
			.join("")
			.replace(new RegExp(`^${BASE_29_BOOK_ALPHABET[0]}*`), ""),
		BASE_29_BIGINT,
		BASE_29_BOOK_ALPHABET,
	);

	lg(`'fromBase29Book' took ${Date.now() - time}ms`);

	return result;
};

const fromBase81 = (text: string) =>
	fromBase(text, BASE_81_BIGINT, BASE_81_ALPHABET);

const getBookFromContent = (
	content: string[],
	alphabet: "bigint" | "book" = "book",
): Book => {
	const time = Date.now();

	const pages: Page[] = [];

	let page: Page = { key: crypto.randomUUID(), pageNumber: 1, lines: [] };
	let chars = "";

	for (let i = 0; i < BOOK_LENGTH; i++) {
		chars +=
			alphabet === "bigint"
				? BASE_29_BOOK_ALPHABET[
						BASE_29_BIGINT_ALPHABET.indexOf(content[i] || "0")
				  ]
				: content[i] || BASE_29_BOOK_ALPHABET[0];

		if ((i + 1) % 80 === 0) {
			page.lines.push({ chars });
			chars = "";

			if ((i + 1) % 3200 === 0) {
				pages.push(page);
				page = {
					key: crypto.randomUUID(),
					pageNumber: (i + 1) / 3200 + 1,
					lines: [],
				};
			}
		}
	}

	lg(`'getBookFromContent' took ${Date.now() - time}ms`);

	return { pages };
};

const getBookFromId = (bookId: string): Book => {
	const time = Date.now();

	const idBase29Bigint = toBase29(fromBase81(bookId)).split("").reverse();
	const book = getBookFromContent(idBase29Bigint, "bigint");

	lg(`'getBookFromId' took ${Date.now() - time}ms`);

	return book;
};

const findBook = (searchText: string, options?: SearchOptions): Book => {
	const time = Date.now();

	let randomTextBefore = "";
	let randomTextAfter = "";

	if (
		options?.find === "pageWithRandom" ||
		options?.find === "bookWithRandom"
	) {
		const resultLength =
			options?.find === "pageWithRandom" ? PAGE_LENGTH : BOOK_LENGTH;

		const randomTextTotalLength = resultLength - searchText.length;

		const searchTextPosition = Math.floor(
			Math.random() * (randomTextTotalLength + 1),
		);

		for (let i = 0; i < searchTextPosition; i++) {
			randomTextBefore += BASE_29_BOOK_ALPHABET.charAt(
				Math.floor(Math.random() * BASE_29),
			);
		}

		for (let i = searchTextPosition; i < randomTextTotalLength; i++) {
			randomTextAfter += BASE_29_BOOK_ALPHABET.charAt(
				Math.floor(Math.random() * BASE_29),
			);
		}
	}

	const book = getBookFromContent(
		`${randomTextBefore}${searchText.replace(
			/ /g,
			BASE_29_BOOK_ALPHABET[0],
		)}${randomTextAfter}`.split(""),
	);

	lg(`'findBook' took ${Date.now() - time}ms`);

	return {
		...book,
		searchTextStart: randomTextBefore.length,
		searchTextEnd: randomTextBefore.length + searchText.length - 1,
	};
};

export interface SearchOptions {
	find: "firstBook" | "pageWithRandom" | "bookWithRandom";
}

export type Message =
	| {
			operation: "getBookFromId" | "findBook";
			data: string;
			options?: SearchOptions;
	  }
	| {
			operation: "getId";
			data: Page[];
	  };

onmessage = ({ data }: MessageEvent<Message>) => {
	const time = Date.now();

	let result;

	switch (data.operation) {
		case "getBookFromId":
			result = getBookFromId(data.data);
			break;

		case "findBook":
			result = findBook(data.data, data.options);
			break;

		case "getId":
			result = toBase81(fromBase29Book(data.data));
	}

	lg(`operation took ${Date.now() - time}ms`);

	postMessage({ operation: data.operation, result });
};

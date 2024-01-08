import { Book, Page } from "@/components/BookPage";
import { lg } from "./utils";

const BOOK_LENGTH = 1312000;
const PAGE_LENGTH = 3200;

const BASE_29 = 29;
const BASE_29_BIGINT_ALPHABET = "0123456789abcdefghijklmnopqrs";
// We use a middle dot, because non-breaking spaces don't break (yep...),
// and spaces are collapsed (until `white-space-collapse: break-spaces`
// is widely supported, see https://developer.mozilla.org/en-US/docs/Web/CSS/white-space-collapse)
const BASE_29_BOOK_ALPHABET = "·abcdefghijklmnopqrstuvwxyz,.";

const BASE_81 = 81n;
const BASE_81_ALPHABET =
	"!#$%&*+,-/0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz|~";

const toBase29 = (value: bigint): string => {
	return value.toString(BASE_29);
};

const toBase81 = (value: bigint): string => {
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

	return result;
};

const fromBase81 = (text: string): bigint => {
	// let result = 0n;
	//
	// Successive multiplications method; 30s for 500,000 random digits from base 10, compared to 100ms for BigInt
	// for (let i = 0; i < text.length; i++) {
	// 	result =
	// 		result * BASE_81 + BigInt(BASE_81_ALPHABET.indexOf(text.charAt(i)));
	// }
	//
	// Digit power method; much slower that successive multiplications
	// for (let i = text.length - 1; i >= 0; i--) {
	// 	result +=
	// 		BigInt(BASE_81_ALPHABET.indexOf(text.charAt(i))) *
	// 		BASE_81 ** BigInt(text.length - 1 - i);
	// }
	//
	// Multiplier increase method; also slow
	// let multiplier = 1n;
	// for (let i = text.length - 1; i >= 0; i--) {
	// 	result += BigInt(BASE_81_ALPHABET.indexOf(text.charAt(i))) * multiplier;
	// 	multiplier *= BASE_81;
	// }
	// return result;

	// Pairing algorithm, taken from V8's source code; 120ms for 500,000 random digits from base 10, just slightly slower than BigInt
	// https://github.com/v8/v8/blob/main/src/bigint/fromstring.cc
	// https://zwyx.dev/til/2023/12/31/Fast%20string-to-integer%20conversion
	let parts = text
		.split("")
		.map((part) => [BigInt(BASE_81_ALPHABET.indexOf(part)), BASE_81]);

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

	return parts[0][0] * parts[1][1] + parts[1][0];
};

const getBookFromContent = (
	content: string[],
	alphabet: "bigint" | "book",
): Book => {
	const book: Book = [];

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
				book.push(page);
				page = {
					key: crypto.randomUUID(),
					pageNumber: (i + 1) / 3200 + 1,
					lines: [],
				};
			}
		}
	}

	return book;
};

const getBookFromId = (bookId: string): Book => {
	const time = Date.now();

	const idBase29Bigint = toBase29(fromBase81(bookId)).split("").reverse();
	const book = getBookFromContent(idBase29Bigint, "bigint");

	lg(`'getBookFromId' took ${Date.now() - time}ms`);

	return book;
};

const findBook = (searchText: string, options?: SearchOptions) => {
	const time = Date.now();

	let randomTextBefore = "";
	let randomTextAfter = "";

	if (options?.find === "pageWithRandom") {
		const randomTextTotalLength = PAGE_LENGTH - searchText.length;

		const searchTextPosition = Math.floor(
			Math.random() * randomTextTotalLength,
		);

		for (let i = 0; i < searchTextPosition; i++) {
			randomTextBefore += BASE_29_BOOK_ALPHABET.charAt(
				Math.floor(Math.random() * BASE_29),
			);
		}

		for (
			let i = searchTextPosition + searchText.length;
			i < randomTextTotalLength;
			i++
		) {
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
		"book",
	);

	lg(`'findBook' took ${Date.now() - time}ms`);

	return book;
};

export interface SearchOptions {
	find: "firstBook" | "pageWithRandom";
}

export interface Message {
	operation: "getBookFromId" | "findBook";
	data: string;
	options?: SearchOptions;
}

onmessage = ({ data: { operation, data, options } }: MessageEvent<Message>) => {
	let result;

	switch (operation) {
		case "getBookFromId":
			result = getBookFromId(data);
			break;

		case "findBook":
			result = findBook(data, options);
	}

	postMessage(result);
};

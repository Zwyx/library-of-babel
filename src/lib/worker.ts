import {
	BASE_16_ALPHABET,
	BASE_16_BIGINT,
	BASE_29,
	BASE_29_ALPHABET,
	BASE_29_BIGINT,
	BASE_94_ALPHABET,
	BASE_94_ALPHABET_REGEX,
	BASE_94_BIGINT,
	BOOKS_PER_ROOM_BIGINT,
	BOOKS_PER_SHELVES_BIGINT,
	BOOKS_PER_WALL_BIGINT,
	Book,
	BookImageData,
	BookMetadata,
	CHARS_PER_BOOK,
	CHARS_PER_PAGE,
	MessageFromWorker,
	MessageToWorker,
	Page,
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

const toBase = (value: bigint, base: bigint, alphabet: string): string => {
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
	// https://zwyx.dev/til/2024/02/01/Fast%20integer-to-string%20conversion

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

const fromBase = (text: string, base: bigint, alphabet: string): bigint => {
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
	// https://zwyx.dev/til/2023/12/31/Fast%20string-to-integer%20conversion

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

const toBase29 = (value: bigint) =>
	toBase(value, BASE_29_BIGINT, BASE_29_ALPHABET);

const toBase94 = (value: bigint) =>
	toBase(value, BASE_94_BIGINT, BASE_94_ALPHABET);

const fromBase16 = (text: string) =>
	fromBase(text, BASE_16_BIGINT, BASE_16_ALPHABET);

const fromBase29 = (text: string) =>
	fromBase(text, BASE_29_BIGINT, BASE_29_ALPHABET);

const fromBase94 = (text: string) =>
	fromBase(text, BASE_94_BIGINT, BASE_94_ALPHABET);

const getBookIndexFromBookId = (rawBookId: string): bigint | null => {
	const startTime = Date.now();

	const bookId = rawBookId.replace(
		new RegExp(`[^${BASE_94_ALPHABET_REGEX}]`, "g"),
		"",
	);

	if (!bookId) {
		return null;
	}

	const bookIndex = fromBase94(bookId);

	lg(`'getBookIndexFromBookId' took ${Date.now() - startTime}ms`);

	return bookIndex;
};

const getBookIndexFromBookImage = (bookImage: BookImageData): bigint | null => {
	const startTime = Date.now();

	const bookIndexHex = bookImage
		.flatMap((value) => [
			(value & 0b1111).toString(16),
			(value >> 4).toString(16),
		])
		.reverse()
		.join("");

	const bookIndex = fromBase16(bookIndexHex);

	lg(`'getBookIndexFromBookImage' took ${Date.now() - startTime}ms`);

	return bookIndex;
};

const getBookFromBookContent = (bookContent: string[]): Book => {
	const startTime = Date.now();

	const pages: Page[] = [];

	let page: Page = { lines: [] };
	let chars = "";

	for (let i = 0; i < CHARS_PER_BOOK; i++) {
		chars += bookContent[i] || BASE_29_ALPHABET[0];

		if ((i + 1) % 80 === 0) {
			page.lines.push({ chars });
			chars = "";

			if ((i + 1) % 3200 === 0) {
				pages.push(page);
				page = { lines: [] };
			}
		}
	}

	lg(`'getBookFromBookContent' took ${Date.now() - startTime}ms`);

	return { pages };
};

const getBookFromBookIndex = (bookIndex: bigint): Book => {
	const startTime = Date.now();

	const bookContent = toBase29(bookIndex).split("").reverse();

	const book = getBookFromBookContent(bookContent);

	lg(`'getBookFromBookIndex' took ${Date.now() - startTime}ms`);

	return book;
};

const getBookIdFromBookIndex = (bookIndex: bigint): string => {
	const startTime = Date.now();

	const bookId = toBase94(bookIndex);

	lg(`'getBookIdFromBookIndex' took ${Date.now() - startTime}ms`);

	return bookId;
};

const findBook = (
	rawSearchText: string | undefined,
	numberOfPages: number,
): Book | null => {
	const startTime = Date.now();

	let searchText = "";

	if (typeof rawSearchText === "string") {
		searchText = rawSearchText
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(new RegExp(`[^${BASE_29_ALPHABET}]`, "g"), "");

		if (!searchText) {
			return null;
		}
	}

	let randomTextBefore = "";
	let randomTextAfter = "";

	if (numberOfPages) {
		const resultLength = CHARS_PER_PAGE * numberOfPages;

		const randomTextTotalLength = resultLength - searchText.length;

		const searchTextPosition = Math.floor(
			Math.random() * (randomTextTotalLength + 1),
		);

		for (let i = 0; i < searchTextPosition; i++) {
			randomTextBefore += BASE_29_ALPHABET.charAt(
				Math.floor(Math.random() * BASE_29),
			);
		}

		for (let i = searchTextPosition; i < randomTextTotalLength; i++) {
			randomTextAfter += BASE_29_ALPHABET.charAt(
				Math.floor(Math.random() * BASE_29),
			);
		}
	}

	const book = getBookFromBookContent(
		`${randomTextBefore}${searchText}${randomTextAfter}`.split(""),
	);

	lg(`'findBook' took ${Date.now() - startTime}ms`);

	return {
		...book,
		searchTextStart: randomTextBefore.length,
		searchTextEnd: randomTextBefore.length + searchText.length - 1,
	};
};

const getBookIndexFromBook = (book: Book): bigint => {
	const startTime = Date.now();

	const bookIndexBase29 = book.pages
		.reverse()
		.map(({ lines }) =>
			lines
				.reverse()
				.map(({ chars }) => chars.split("").reverse().join(""))
				.join(""),
		)
		.join("")
		.replace(new RegExp(`^${BASE_29_ALPHABET[0]}*`), "");

	const bookIndex = fromBase29(bookIndexBase29);

	lg(`'getBookIndexFromBook' took ${Date.now() - startTime}ms`);

	return bookIndex;
};

const getBookMetadataFromBookIndex = (bookIndex: bigint): BookMetadata => {
	const startTime = Date.now();

	const bookId = getBookIdFromBookIndex(bookIndex);

	const roomIndex = bookIndex / BOOKS_PER_ROOM_BIGINT;
	const bookIndexInRoom = bookIndex % BOOKS_PER_ROOM_BIGINT;
	const wallIndexInRoom = bookIndexInRoom / BOOKS_PER_WALL_BIGINT;
	const bookIndexInWall = bookIndexInRoom % BOOKS_PER_WALL_BIGINT;
	const shelfIndexInWall = bookIndexInWall / BOOKS_PER_SHELVES_BIGINT;
	const bookIndexInShelf = bookIndexInWall % BOOKS_PER_SHELVES_BIGINT;

	const bookContentHex = bookIndex.toString(16).split("").reverse();

	const bookImageData = bookContentHex.reduce((acc, cur, i) => {
		if (i % 2 === 0) {
			acc.push(
				parseInt(cur, 16) + (parseInt(bookContentHex[i + 1], 16) || 0) * 16,
			);
		}
		return acc;
	}, [] as number[]);

	lg(`'getBookMetadata' took ${Date.now() - startTime}ms`);

	return {
		bookId,
		roomIndex: (roomIndex + 1n).toString(),
		wallIndexInRoom: (wallIndexInRoom + 1n).toString(),
		shelfIndexInWall: (shelfIndexInWall + 1n).toString(),
		bookIndexInShelf: (bookIndexInShelf + 1n).toString(),
		bookImageData,
	};
};

onmessage = ({ data }: MessageEvent<MessageToWorker>) => {
	const startTime = Date.now();

	const operation = data.operation;
	let result: MessageFromWorker;

	try {
		switch (operation) {
			case "browse": {
				const bookIndex =
					data.source === "bookId" ?
						getBookIndexFromBookId(data.bookId)
					:	getBookIndexFromBookImage(data.bookImageData);

				const book = bookIndex ? getBookFromBookIndex(bookIndex) : undefined;

				const bookId =
					data.source === "bookImage" && bookIndex ?
						getBookIdFromBookIndex(bookIndex)
					:	undefined;

				result = {
					operation,
					...(book ? { book } : { invalidData: true }),
					bookId,
				};

				break;
			}

			case "search":
			case "random": {
				const book =
					operation === "search" ?
						findBook(data.searchText, data.searchOptions.numberOfPages)
					:	findBook(undefined, data.randomOptions.numberOfPages);

				result = {
					operation,
					...(book ? { book } : { invalidData: true }),
				};

				break;
			}

			case "getBookMetadata": {
				const bookIndex = getBookIndexFromBook(data.book);
				const bookMetadata = getBookMetadataFromBookIndex(bookIndex);

				result = {
					operation,
					bookMetadata,
				};

				break;
			}
		}
	} catch (error) {
		result = {
			operation,
			error,
		};
	}

	lg(`operation '${operation}' took ${Date.now() - startTime}ms`);

	postMessage(result);
};

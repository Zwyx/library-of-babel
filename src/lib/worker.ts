import {
	BASE_29,
	BASE_29_ALPHABET,
	BASE_29_BIGINT,
	BASE_94_ALPHABET_REGEX,
	BOOKS_PER_ROOM_BIGINT,
	BOOKS_PER_SHELVES_BIGINT,
	BOOKS_PER_WALL_BIGINT,
	Book,
	BookImageData,
	BookMetadata,
	CHARS_PER_BOOK,
	CHARS_PER_BOOK_BIGINT,
	CHARS_PER_PAGE,
	MAX_BOOK_ID_LENGTH,
	MAX_BOOK_IMAGE_DATA_LENGTH,
	MessageFromWorker,
	MessageToWorker,
	Page,
} from "@/lib/common";
import { lg } from "@/lib/utils";
import {
	fromBase16,
	fromBase29,
	fromBase94,
	toBase29,
	toBase94,
} from "./baseConversions";

let lastBookIndex: bigint | undefined;

// Some browsers like Firefox and Safari are limited, so we want to do this calculation
// only if we need it
const getLastBookIndex = (): bigint => {
	if (typeof lastBookIndex !== "bigint") {
		lastBookIndex = BASE_29_BIGINT ** CHARS_PER_BOOK_BIGINT - 1n;
	}
	return lastBookIndex;
};

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

const findBook = (searchText: string = "", numberOfPages: number): Book => {
	const startTime = Date.now();

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
				let bookIndex: bigint | null;
				let dataTruncated: boolean | undefined = undefined;
				let maybeDataTruncated: boolean = false;

				if (data.source === "bookId") {
					let bookId;

					if (data.bookId.length <= MAX_BOOK_ID_LENGTH) {
						maybeDataTruncated = data.bookId.length === MAX_BOOK_ID_LENGTH;
						bookId = data.bookId;
					} else {
						dataTruncated = true;
						bookId = data.bookId.slice(data.bookId.length - MAX_BOOK_ID_LENGTH);
					}

					bookIndex = getBookIndexFromBookId(bookId);
				} else {
					let bookImageData;

					if (data.bookImageData.length <= MAX_BOOK_IMAGE_DATA_LENGTH) {
						maybeDataTruncated =
							data.bookImageData.length === MAX_BOOK_IMAGE_DATA_LENGTH;
						bookImageData = data.bookImageData;
					} else {
						dataTruncated = true;
						bookImageData = data.bookImageData.slice(
							0,
							MAX_BOOK_IMAGE_DATA_LENGTH,
						);
					}

					bookIndex = getBookIndexFromBookImage(bookImageData);
				}

				if (maybeDataTruncated && bookIndex) {
					dataTruncated = bookIndex > getLastBookIndex();
				}

				const book = bookIndex ? getBookFromBookIndex(bookIndex) : undefined;

				const bookId =
					data.source === "bookImage" && bookIndex ?
						getBookIdFromBookIndex(bookIndex)
					:	undefined;

				result = {
					operation,
					...(book ? { book } : { invalidData: true }),
					bookId,
					dataTruncated,
				};

				break;
			}

			case "search":
			case "random": {
				let book: Book | null;
				let dataTruncated: boolean | undefined = undefined;

				if (operation === "search") {
					let searchText;

					const rawSearchText = data.searchText
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, "")
						.toLowerCase()
						.replace(new RegExp(`[^${BASE_29_ALPHABET}]`, "g"), "");

					if (rawSearchText.length <= CHARS_PER_BOOK) {
						searchText = rawSearchText;
					} else {
						dataTruncated = true;
						searchText = rawSearchText.slice(0, CHARS_PER_BOOK);
					}

					book =
						searchText ?
							findBook(searchText, data.searchOptions.numberOfPages)
						:	null;
				} else {
					book = findBook(undefined, data.randomOptions.numberOfPages);
				}

				result = {
					operation,
					...(book ? { book } : { invalidData: true }),
					dataTruncated,
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

export interface OutletContext {
	lastLibraryModeCheckDone: boolean;
}

export const WALLS_PER_ROOM = 4;
export const SHELVES_PER_WALLS = 5;
export const BOOKS_PER_SHELVES = 32;
export const PAGES_PER_BOOK = 410;
export const LINES_PER_PAGE = 40;
export const CHARS_PER_LINE = 80;

export const BOOKS_PER_ROOM =
	WALLS_PER_ROOM * SHELVES_PER_WALLS * BOOKS_PER_SHELVES; // 640
export const BOOKS_PER_WALL = SHELVES_PER_WALLS * BOOKS_PER_SHELVES; // 160
export const CHARS_PER_BOOK = PAGES_PER_BOOK * LINES_PER_PAGE * CHARS_PER_LINE; // 1,312,000
export const CHARS_PER_PAGE = LINES_PER_PAGE * CHARS_PER_LINE; //3200

export const WALLS_PER_ROOM_BIGINT = BigInt(WALLS_PER_ROOM);
export const SHELVES_PER_WALLS_BIGINT = BigInt(SHELVES_PER_WALLS);
export const BOOKS_PER_SHELVES_BIGINT = BigInt(BOOKS_PER_SHELVES);
export const PAGES_PER_BOOK_BIGINT = BigInt(PAGES_PER_BOOK);
export const LINES_PER_PAGE_BIGINT = BigInt(LINES_PER_PAGE);
export const CHARS_PER_LINE_BIGINT = BigInt(CHARS_PER_LINE);

export const BOOKS_PER_ROOM_BIGINT = BigInt(BOOKS_PER_ROOM);
export const BOOKS_PER_WALL_BIGINT = BigInt(BOOKS_PER_WALL);
export const CHARS_PER_BOOK_BIGINT = BigInt(CHARS_PER_BOOK);
export const CHARS_PER_PAGE_BIGINT = BigInt(CHARS_PER_PAGE);

export const BASE_10 = 10;
export const BASE_16 = 16;
export const BASE_29 = 29;
export const BASE_94 = 94;

export const BASE_10_BIGINT = BigInt(BASE_10);
export const BASE_16_BIGINT = BigInt(BASE_16);
export const BASE_29_BIGINT = BigInt(BASE_29);
export const BASE_94_BIGINT = BigInt(BASE_94);

export const BASE_10_ALPHABET = "0123456789";
export const BASE_16_ALPHABET = "0123456789abcdef";
export const BASE_29_ALPHABET = " abcdefghijklmnopqrstuvwxyz,.";
// All ASCII printable characters except space
export const BASE_94_ALPHABET =
	"!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
export const BASE_94_ALPHABET_REGEX =
	"!\\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

export const BASES_QUOTIENT = Math.log(BASE_29) / Math.log(BASE_94);

// Long calculations which would freezes the UI when the app loads,
// so we calculate the values and hardcode them:
// const lastBookIndex = BASE_29_BIGINT ** CHARS_PER_BOOK_BIGINT - 1n;
// console.log(toBase94(lastBookIndex).length);
export const MAX_BOOK_ID_LENGTH = 972_399;
// Values are between 0 and 255; there are 4 values per pixel (RGBA) so the result must be ceiled to the nearest greater multiple of 4
// console.log(lastBookIndex.toString(16).length / 2);
export const MAX_BOOK_IMAGE_DATA_LENGTH = 796_712;

const libraryModes = ["browse", "search", "random"] as const;
export type LibraryMode = (typeof libraryModes)[number];
export const isLibraryMode = (value: unknown): value is LibraryMode =>
	typeof value === "string" && libraryModes.includes(value as LibraryMode);

export interface SearchOptions {
	/** min: 0; max: 410; `0` means only the search text */
	numberOfPages: number;
}

export interface RandomOptions {
	/** min: 1; max: 410 */
	numberOfPages: number;
}

export interface OptionsDialogSettings {
	autoRerun: boolean;
	searchCustomNumberOfPages: number;
	randomCustomNumberOfPages: number;
}

export interface Line {
	chars: string;
}

export interface Page {
	// Will be useful if we want to display a full book
	// key: string;
	lines: Line[];
}

/**
 * If `end` is `null`, `start` is only used to mark a page number, not a selection
 */
export interface Selection {
	start: number;
	end: number | null;
}

export interface Book {
	pages: Page[];
	selection?: Selection;
}

export type BookImageData = number[];

export interface BookImageDimensions {
	width: number;
	height: number;
}

export interface BookImage extends BookImageDimensions {
	data: BookImageData;
}

export interface BookMetadata {
	bookId: string;
	roomIndex: string;
	wallIndexInRoom: string;
	shelfIndexInWall: string;
	bookIndexInShelf: string;
	bookImageData: BookImageData;
}

export type MessageToWorker =
	| {
			operation: "browse";
			source: "bookId";
			bookId: string;
	  }
	| {
			operation: "browse";
			source: "bookImage";
			bookImageData: BookImageData;
	  }
	| {
			operation: "search";
			searchText: string;
			searchOptions: SearchOptions;
	  }
	| {
			operation: "random";
			randomOptions: RandomOptions;
	  }
	| {
			operation: "getBookMetadata";
			book: Book;
	  };

export type MessageFromWorker = Pick<MessageToWorker, "operation"> &
	(
		| {
				operation: "browse" | "search" | "random";
				book?: Book;
				bookId?: string;
				dataTruncated?: boolean;
				invalidData?: boolean;
				error?: unknown;
		  }
		| {
				operation: "getBookMetadata";
				bookMetadata?: BookMetadata;
				error?: unknown;
		  }
	);

export interface ShareData {
	bookId: string;
	pageNumber?: number;
	selection?: Selection;
}

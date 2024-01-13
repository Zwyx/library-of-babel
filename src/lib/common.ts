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

export const BASE_29 = 29;
export const BASE_81 = 81;

export const BASE_29_BIGINT = BigInt(BASE_29);
export const BASE_81_BIGINT = BigInt(BASE_81);

export const BASE_29_BIGINT_ALPHABET = "0123456789abcdefghijklmnopqrs";
export const BASE_29_BOOK_ALPHABET = " abcdefghijklmnopqrstuvwxyz,.";
export const BASE_81_ALPHABET =
	"!#$%&*+,-/0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz|~";

export interface Line {
	chars: string;
}

export interface Page {
	key: string;
	pageNumber: number;
	lines: Line[];
}

export interface Book {
	pages: Page[];
	searchTextStart?: number;
	searchTextEnd?: number;
}

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

export interface BookIdData {
	bookId: string;
	roomIndex: string;
	wallIndexInRoom: string;
	shelfIndexInWall: string;
	bookIndexInShelf: string;
}

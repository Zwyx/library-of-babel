// Was extracted from the main file to allow React Refresh to work
// (see ESLint `react-refresh/only-export-components`)

export const ABOUT = "about";
export const ABOUT_DELIMITER = "--";

export const aboutDialogIds = [
	"intro",
	"the-library",
	"this-app",
	"the-book-id",
	"the-book-content",
	"the-book-image",
	"privacy",
	"fast-base-conversion-algorithms",
	"browsers-limitations",
	"miscellaneous",
] as const;
export type AboutDialogId = (typeof aboutDialogIds)[number];
export const isAboutDialogId = (value: unknown): value is AboutDialogId =>
	typeof value === "string" && aboutDialogIds.includes(value as AboutDialogId);

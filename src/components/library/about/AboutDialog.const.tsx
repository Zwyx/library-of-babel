// Was extracted from the main context file because of the ESLint warning `react-refresh/only-export-components`

export const aboutDialogIds = [
	"the-library",
	"this-app",
	"the-book-id",
	"the-book-content",
	"the-book-image",
	"fast-base-conversion-algorithms",
	"browsers-limitations",
] as const;
export type AboutDialogId = (typeof aboutDialogIds)[number];
export const isAboutDialogId = (value: unknown): value is AboutDialogId =>
	typeof value === "string" && aboutDialogIds.includes(value as AboutDialogId);

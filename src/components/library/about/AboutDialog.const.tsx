// Was extracted from the main context file because of the ESLint warning `react-refresh/only-export-components`

export const aboutDialogIds = ["browsers-limitations", "tbd"] as const;
export type AboutDialogId = (typeof aboutDialogIds)[number];
export const isAboutDialogId = (value: unknown): value is AboutDialogId =>
	typeof value === "string" && aboutDialogIds.includes(value as AboutDialogId);

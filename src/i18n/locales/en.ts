import { DeepReplace } from "@/lib/utils";

export const en = {
	headerMenu: {
		libraryOfBabel: "The Library of Babel",
		openMenu: "Open menu",
		version: "version",
	},

	languageSelector: {
		chooseLanguage: "Choose language",
	},

	siteHeader: {
		libraryOfBabel: "The Library of Babel",
	},

	themeSelector: {
		chooseTheme: "Choose theme",
		dark: "Dark",
		light: "Light",
		sameAsDevice: "Same as device",
	},
} as const;

export type I18nLocale = DeepReplace<typeof en, [string, string]>;

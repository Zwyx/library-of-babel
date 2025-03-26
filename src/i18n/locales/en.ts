import { DeepReplace } from "@/lib/utils";

export const en = {
	headerMenu: {
		libraryOfBabel: "The Library of Babel",
		openMenu: "Open menu",
		version: "version",
	},

	languageSelector: {
		chooseLanguage: "Choose language",
		language: "Language",
	},

	siteHeader: {
		libraryOfBabel: "The Library of Babel",
	},

	themeSelector: {
		chooseTheme: "Choose theme",
		dark: "Dark",
		light: "Light",
		sameAsDevice: "Same as device",
		theme: "Theme",
	},
};

export type I18nLocale = DeepReplace<typeof en, [string, string]>;

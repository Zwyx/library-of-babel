import { DeepReplace } from "@/lib/utils";

export const en = {
	languageSelector: {
		chooseLanguage: "Choose language",
	},

	themeSelector: {
		chooseTheme: "Choose theme",
		dark: "Dark",
		light: "Light",
		sameAsDevice: "Same as device",
	},
} as const;

export type I18nLocale = DeepReplace<typeof en, [string, string]>;

import { LOCALE_KEY } from "@/lib/local-storage-keys";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { fr } from "./locales/fr";

export const resources = {
	en,
	fr,
};

export type I18nLocaleCode = keyof typeof resources;

const isLocaleCode = (value: unknown): value is I18nLocaleCode =>
	typeof value === "string" && Object.keys(resources).includes(value);

const storedLocaleCode = localStorage.getItem(LOCALE_KEY);

i18n.on("languageChanged", (lng) => {
	document.documentElement.lang = lng;
});

i18n.use(initReactI18next).init({
	// debug: true,
	lng: isLocaleCode(storedLocaleCode) ? storedLocaleCode : navigator.language,
	fallbackLng: "en",
	ns: Object.keys(resources.en),
	resources,
	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
});

export default i18n;

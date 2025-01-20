// Was extracted from the main file for React Refresh (see ESLint `react-refresh/only-export-components`)

import { createContext, Dispatch, useContext } from "react";
import { THEME_CHOICE_KEY } from "./local-storage-keys";

const themeSchemes = ["light", "dark"] as const;
export type ThemeScheme = (typeof themeSchemes)[number];
const isThemeScheme = (value: unknown): value is ThemeScheme =>
	typeof value === "string" && themeSchemes.includes(value as ThemeScheme);

const themeChoices = [...themeSchemes, "system"] as const;
export type ThemeChoice = (typeof themeChoices)[number];
const isThemeChoice = (value: unknown): value is ThemeChoice =>
	typeof value === "string" && themeChoices.includes(value as ThemeChoice);

export const lightThemeName: ThemeScheme = "light";
export const darkThemeName: ThemeScheme = "dark";
const defaultThemeChoice: ThemeChoice = "system";

export const ThemeContext = createContext<
	| {
			themeChoice: ThemeChoice;
			themeScheme: ThemeScheme;
			updateThemeChoice: Dispatch<ThemeChoice>;
	  }
	| undefined
>(undefined);

const storedThemeChoice = localStorage.getItem(THEME_CHOICE_KEY);

export const getStartupThemeChoice: ThemeChoice =
	isThemeChoice(storedThemeChoice) ? storedThemeChoice : defaultThemeChoice;

export const getThemeSchemeFromChoice = (
	themeChoice: ThemeChoice,
): ThemeScheme =>
	isThemeScheme(themeChoice) ? themeChoice
	: matchMedia("(prefers-color-scheme: dark)").matches ? "dark"
	: "light";

export const useThemeContext = () => {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useThemeContext must be used within ThemeContext");
	}

	return context;
};

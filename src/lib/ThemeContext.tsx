import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import {
	ThemeChoice,
	ThemeContext,
	ThemeScheme,
	darkThemeName,
	getStartupThemeChoice,
	getThemeSchemeFromChoice,
	lightThemeName,
} from "./ThemeContext.const";
import { THEME_CHOICE_KEY } from "./local-storage-keys";

export const ThemeContextProvider = ({ children }: PropsWithChildren) => {
	const [themeChoice, setThemeChoice] = useState<ThemeChoice>(
		getStartupThemeChoice,
	);

	const [themeScheme, setThemeScheme] = useState<ThemeScheme>(() =>
		getThemeSchemeFromChoice(getStartupThemeChoice),
	);

	useEffect(() => {
		const setThemeSchemeFromChoice = () =>
			setThemeScheme(getThemeSchemeFromChoice(themeChoice));

		setThemeSchemeFromChoice();

		const colorSchemeMediaQuery = matchMedia("(prefers-color-scheme: dark)");

		colorSchemeMediaQuery.addEventListener("change", setThemeSchemeFromChoice);

		return () =>
			colorSchemeMediaQuery.removeEventListener(
				"change",
				setThemeSchemeFromChoice,
			);
	}, [themeChoice]);

	useEffect(() => {
		document.documentElement.classList.add(
			themeScheme === "light" ? lightThemeName : darkThemeName,
		);

		document.documentElement.classList.remove(
			themeScheme === "light" ? darkThemeName : lightThemeName,
		);

		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute(
				"content",
				themeScheme === "light" ? "#ffffff" : "#020817",
			);
	}, [themeScheme]);

	const updateThemeChoice = useCallback((newThemeChoice: ThemeChoice) => {
		localStorage.setItem(THEME_CHOICE_KEY, newThemeChoice);
		setThemeChoice(newThemeChoice);
	}, []);

	return (
		<ThemeContext.Provider
			value={{ themeChoice, themeScheme, updateThemeChoice }}
		>
			{children}
		</ThemeContext.Provider>
	);
};

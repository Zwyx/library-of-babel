import {
	Dispatch,
	ReactNode,
	createContext,
	useCallback,
	useEffect,
	useState,
} from "react";
import { THEME_CHOICE_KEY } from "./keys";

const themeSchemes = ["light", "dark"] as const;
type ThemeScheme = (typeof themeSchemes)[number];
const isThemeScheme = (value: unknown): value is ThemeScheme =>
	typeof value === "string" && themeSchemes.includes(value as ThemeScheme);

const themeChoices = [...themeSchemes, "system"] as const;
type ThemeChoice = (typeof themeChoices)[number];
const isThemeChoice = (value: unknown): value is ThemeChoice =>
	typeof value === "string" && themeChoices.includes(value as ThemeChoice);

const lightThemeName: ThemeScheme = "light";
const darkThemeName: ThemeScheme = "dark";
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

const getStartupThemeChoice: ThemeChoice = isThemeChoice(storedThemeChoice)
	? storedThemeChoice
	: defaultThemeChoice;

const getThemeSchemeFromChoice = (themeChoice: ThemeChoice): ThemeScheme =>
	isThemeScheme(themeChoice)
		? themeChoice
		: matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
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
		if (themeScheme === "light") {
			if (!document.documentElement.classList.contains(lightThemeName)) {
				document.documentElement.classList.add(lightThemeName);
			}
			if (document.documentElement.classList.contains(darkThemeName)) {
				document.documentElement.classList.remove(darkThemeName);
			}
		} else {
			if (!document.documentElement.classList.contains(darkThemeName)) {
				document.documentElement.classList.add(darkThemeName);
			}
			if (document.documentElement.classList.contains(lightThemeName)) {
				document.documentElement.classList.remove(lightThemeName);
			}
		}
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

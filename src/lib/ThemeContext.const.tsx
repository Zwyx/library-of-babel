import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

// Was extracted from the main context file because of the ESLint warning `react-refresh/only-export-components`

export const useThemeContext = () => {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useThemeContext must be within ThemeContext");
	}

	return context;
};

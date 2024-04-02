// Was extracted from the main file to allow React Refresh to work
// (see ESLint `react-refresh/only-export-components`);
// it doesn't seem to work though, we still see `hmr invalidate` warnings,
// maybe because it doesn't work with hooks

import { useContext } from "react";
import { PwaContext } from "./PwaContext";

export const usePwaContext = () => {
	const context = useContext(PwaContext);

	if (context === undefined) {
		throw new Error("usePwaContext must be within PwaContext");
	}

	return context;
};

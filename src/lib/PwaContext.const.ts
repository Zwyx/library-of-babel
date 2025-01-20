// Was extracted from the main file for React Refresh (see ESLint `react-refresh/only-export-components`)

import { createContext, useContext } from "react";

export const PwaContext = createContext<
	| {
			update: (() => Promise<void>) | undefined;
			needsRefresh: boolean;
			refresh: (() => Promise<void>) | undefined;
	  }
	| undefined
>(undefined);

export const usePwaContext = () => {
	const context = useContext(PwaContext);

	if (context === undefined) {
		throw new Error("usePwaContext must be used within PwaContext");
	}

	return context;
};

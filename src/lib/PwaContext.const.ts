// Was extracted from the main file for React Refresh (see ESLint `react-refresh/only-export-components`)

import { Dispatch, createContext, useContext } from "react";

export const PwaContext = createContext<
	| {
			version: string;
			refreshReady: boolean;
			newMajorVersionReady: boolean;
			newMajorVersionAcknowledged: boolean;
			setNewMajorVersionAcknowledged: Dispatch<boolean>;
			checkForNewVersion: () => void;

			/**
			 * Note: the state's data of `useHistoryState` is preserved when using `refresh`,
			 * which means that after the refresh, there might be data in the history state
			 * that is incompatible with the new version of the app.
			 */
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

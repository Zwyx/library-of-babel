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

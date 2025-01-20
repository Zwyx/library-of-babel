// Was extracted from the main file for React Refresh (see ESLint `react-refresh/only-export-components`)

import { createContext, useContext } from "react";

export const WorkerContext = createContext<
	| {
			worker: Worker;
	  }
	| undefined
>(undefined);

export const useWorkerContext = () => {
	const context = useContext(WorkerContext);

	if (context === undefined) {
		throw new Error("useWorkerContext must be used within WorkerContext");
	}

	return context;
};

// Was extracted from the main file to allow React Refresh to work
// (see ESLint `react-refresh/only-export-components`);
// it doesn't seem to work though, we still see `hmr invalidate` warnings,
// maybe because it doesn't work with contexts

import { useContext } from "react";
import { WorkerContext } from "./WorkerContext";

export const useWorkerContext = () => {
	const context = useContext(WorkerContext);

	if (context === undefined) {
		throw new Error("useWorkerContext must be within WorkerContext");
	}

	return context;
};

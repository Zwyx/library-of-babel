import { useContext } from "react";
import { WorkerContext } from "./WorkerContext";

// Was extracted from the main context file because of the ESLint warning `react-refresh/only-export-components`

export const useWorkerContext = () => {
	const context = useContext(WorkerContext);

	if (context === undefined) {
		throw new Error("useWorkerContext must be within WorkerContext");
	}

	return context;
};

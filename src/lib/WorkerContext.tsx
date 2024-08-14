import { PropsWithChildren, createContext } from "react";

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
	type: "module",
});

export const WorkerContext = createContext<
	| {
			worker: Worker;
	  }
	| undefined
>(undefined);

export const WorkerContextProvider = ({ children }: PropsWithChildren) => {
	return (
		<WorkerContext.Provider value={{ worker }}>
			{children}
		</WorkerContext.Provider>
	);
};

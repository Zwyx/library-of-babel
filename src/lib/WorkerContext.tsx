import { PropsWithChildren } from "react";
import { WorkerContext } from "./WorkerContext.const";

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
	type: "module",
});

export const WorkerContextProvider = ({ children }: PropsWithChildren) => {
	return (
		<WorkerContext.Provider value={{ worker }}>
			{children}
		</WorkerContext.Provider>
	);
};

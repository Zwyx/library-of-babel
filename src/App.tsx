import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";

const worker = new Worker(new URL("./lib/worker.ts", import.meta.url));

export const App = () => {
	useEffect(() => {
		worker.onmessage = (e: MessageEvent<string>) => {
			console.info(`Message received from worker: ${e.data}`);
		};

		worker.postMessage("test");
	}, []);

	return (
		<div className="flex flex-col items-center">
			<SiteHeader />
			<Outlet />
		</div>
	);
};

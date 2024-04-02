import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
	Navigate,
	RouterProvider,
	createBrowserRouter,
	useRouteError,
} from "react-router-dom";
import { App } from "./App.tsx";
import { UnexpectedError } from "./components/UnexpectedError.tsx";
import "./i18n/i18n.ts";
import "./index.css";
import { PwaContextProvider } from "./lib/PwaContext.tsx";
import { ThemeContextProvider } from "./lib/ThemeContext.tsx";
import { WorkerContextProvider } from "./lib/WorkerContext.tsx";
import { initPlausible } from "./lib/plausible.ts";
import { initSentry, sendToSentry } from "./lib/sentry.ts";
import { Home } from "./pages/Home.tsx";
import { Intro } from "./pages/Intro.tsx";
import { Library } from "./pages/Library.tsx";

// Clear the state to prevent dialogs from showing up again if the user reloads the page
history.replaceState(undefined, "");

// We reimplemented Sentry's and Plausible's client-side behaviours ourselves,
// in order to ensure that we cannot leak any IDs or encryption keys
initSentry();
initPlausible();

export const RouteErrorElement = () => {
	const routeError = useRouteError();

	useEffect(() => {
		if (
			typeof routeError === "object" &&
			routeError &&
			"stack" in routeError &&
			typeof routeError.stack === "string"
		) {
			sendToSentry({
				stack: routeError.stack,
				mechanism: { type: "instrument", handled: false },
			});
		} else {
			sendToSentry({
				manuallyWrittenSafeErrorMessage: "Unknown route error",
				mechanism: { type: "generic", handled: false },
			});
		}
	}, [routeError]);

	return <UnexpectedError />;
};

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <RouteErrorElement />,
		element: <App />,
		children: [
			{
				path: "",
				element: <Home />,
			},
			{
				path: "intro",
				element: <Intro />,
			},
			{
				path: "browse",
				element: <Library mode="browse" />,
			},
			{
				path: "search",
				element: <Library mode="search" />,
			},
			{
				path: "random",
				element: <Library mode="random" />,
			},
			{
				path: ":id",
				element: <Library mode="browse" />,
			},
			{
				path: "*",
				element: <Navigate to="" replace />,
			},
		],
	},
]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<PwaContextProvider>
			<ThemeContextProvider>
				<WorkerContextProvider>
					<RouterProvider router={router} />
				</WorkerContextProvider>
			</ThemeContextProvider>
		</PwaContextProvider>
	</React.StrictMode>,
);

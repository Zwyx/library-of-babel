import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router";
import { App } from "./App.tsx";
import { RouteErrorElement } from "./components/error/RouteErrorElement.tsx";
import "./i18n/i18n.ts";
import "./index.css";
import { PwaContextProvider } from "./lib/PwaContext.tsx";
import { ThemeContextProvider } from "./lib/ThemeContext.tsx";
import { WorkerContextProvider } from "./lib/WorkerContext.tsx";
import { initPlausible } from "./lib/plausible.ts";
import { initSentry } from "./lib/sentry.ts";
import { Home } from "./pages/Home.tsx";
import { Intro } from "./pages/Intro.tsx";
import { Library } from "./pages/Library.tsx";

// Clear the state to prevent dialogs from showing up again if the user reloads the page
history.replaceState(undefined, "");

// We reimplemented Sentry's and Plausible's client-side behaviours ourselves,
// in order to ensure that we cannot leak any IDs or encryption keys
initSentry();
initPlausible();

const router = createBrowserRouter([
	{
		path: "/",

		// Note: this only catches rendering errors, other errors are reported to Sentry
		// but don't make the error element to show up
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
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<PwaContextProvider>
			<ThemeContextProvider>
				<WorkerContextProvider>
					<RouterProvider router={router} />
				</WorkerContextProvider>
			</ThemeContextProvider>
		</PwaContextProvider>
	</StrictMode>,
);

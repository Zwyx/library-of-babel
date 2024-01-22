import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App.tsx";
import "./i18n/i18n.ts";
import "./index.css";
import { ThemeContextProvider } from "./lib/ThemeContext.tsx";
import { WorkerContextProvider } from "./lib/WorkerContext.tsx";
import { Home } from "./pages/Home.tsx";
import { Intro } from "./pages/Intro.tsx";
import { Library } from "./pages/Library.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/intro",
				element: <Intro />,
			},
			{
				path: "/browse",
				element: <Library mode="browse" />,
			},
			{
				path: "/search",
				element: <Library mode="search" />,
			},
			{
				path: "/random",
				element: <Library mode="random" />,
			},
		],
	},
]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeContextProvider>
			<WorkerContextProvider>
				<RouterProvider router={router} />
			</WorkerContextProvider>
		</ThemeContextProvider>
	</React.StrictMode>,
);

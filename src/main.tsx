import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App.tsx";
import "./i18n/i18n.ts";
import "./index.css";
import { ThemeContextProvider } from "./lib/ThemeContext.tsx";
import { WorkerContextProvider } from "./lib/WorkerContext.tsx";
import { Browse } from "./pages/Browse.tsx";
import { Home } from "./pages/Home.tsx";
import { Library } from "./pages/Library.tsx";
import { Questions } from "./pages/Questions.tsx";

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
				path: "/library",
				element: <Library />,
			},
			{
				path: "/browse",
				element: <Browse mode="browse" />,
			},
			{
				path: "/search",
				element: <Browse mode="search" />,
			},
			{
				path: "/random",
				element: <Browse mode="random" />,
			},
			{
				path: "/questions",
				element: <Questions />,
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

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
import { Random } from "./pages/Random.tsx";
import { Search } from "./pages/Search.tsx";

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
				element: <Browse />,
			},
			{
				path: "/search",
				element: <Search />,
			},
			{
				path: "/random",
				element: <Random />,
			},
			{
				path: "/questions",
				element: <Questions />,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeContextProvider>
			<WorkerContextProvider>
				<RouterProvider router={router} />
			</WorkerContextProvider>
		</ThemeContextProvider>
	</React.StrictMode>,
);

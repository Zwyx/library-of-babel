import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App.tsx";
import "./i18n/i18n.ts";
import "./index.css";
import { ThemeContextProvider } from "./lib/ThemeContext.tsx";
import { Browse } from "./pages/Browse.tsx";
import { Home } from "./pages/Home.tsx";

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
				path: "/browse",
				element: <Browse />,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeContextProvider>
			<RouterProvider router={router} />
		</ThemeContextProvider>
	</React.StrictMode>,
);

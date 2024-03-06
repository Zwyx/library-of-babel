import * as Sentry from "@sentry/react";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
	RouterProvider,
	createBrowserRouter,
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
	useRouteError,
} from "react-router-dom";
import { App } from "./App.tsx";
import { Error } from "./components/Error.tsx";
import "./i18n/i18n.ts";
import "./index.css";
import { ThemeContextProvider } from "./lib/ThemeContext.tsx";
import { WorkerContextProvider } from "./lib/WorkerContext.tsx";
import { Home } from "./pages/Home.tsx";
import { Intro } from "./pages/Intro.tsx";
import { Library } from "./pages/Library.tsx";

const pwa =
	document.referrer.startsWith("android-app://") ? "twa"
	: window.matchMedia("(display-mode: standalone)").matches ? "standalone"
	: "browser";

if (import.meta.env.PROD) {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
		integrations: [
			Sentry.reactRouterV6BrowserTracingIntegration({
				useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
		],
		tracePropagationTargets: [`https://${import.meta.env.VITE_DOMAIN}`],
		tracesSampleRate: 0.1,
	});

	Sentry.setTag("pwa", pwa);
}

const sentryCreateBrowserRouter =
	Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const SentryRouteErrorFallback = () => {
	const routeError = useRouteError();

	useEffect(() => {
		Sentry.captureException(routeError);
	}, [routeError]);

	return <Error />;
};

const router = sentryCreateBrowserRouter([
	{
		path: "/",
		errorElement: <SentryRouteErrorFallback />,
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

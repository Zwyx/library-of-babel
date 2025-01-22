import { sendToSentry } from "@/lib/sentry";
import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { Button } from "../ui/button";

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

	return (
		<div className="mt-8 text-center">
			<h1 className="font-semibold">Oops, something went wrong.</h1>

			<p className="mt-4">
				An unexpected error occurred, please reload the page. Sorry for the
				inconvenience.
			</p>

			<Button className="mt-6" onClick={() => location.reload()}>
				Reload
			</Button>
		</div>
	);
};

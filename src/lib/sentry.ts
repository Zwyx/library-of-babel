import { appMode, redactUrl } from "./analytics";
import { getUrl } from "./utils";

// This is a simplified version of Sentry's client SDK,
// made to ensure we never send any IDs or encryption keys

const ERROR_TYPES = [
	"AggregateError",
	"Error",
	"EvalError",
	"InternalError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"TypeError",
	"URIError",
];

let sentryIngest: string = "";

export const initSentry = () => {
	if (!import.meta.env.PROD) {
		return;
	}

	const viteSentryIngest = import.meta.env.VITE_SENTRY_INGEST;

	if (typeof viteSentryIngest !== "string") {
		return;
	}

	sentryIngest = viteSentryIngest;

	window.addEventListener("error", (err) =>
		sendToSentry({
			stack: err.error.stack,
			mechanism: {
				type: "onerror",
				handled: false,
			},
		}),
	);

	window.addEventListener("unhandledrejection", (err) =>
		sendToSentry({
			stack: err.reason.stack,
			mechanism: {
				type: "onunhandledrejection",
				handled: false,
			},
		}),
	);

	if (!Math.floor(Math.random() * 100)) {
		sendToSentry({ message: "Sentry health check" });
	}
};

export const sendToSentry = (
	event:
		| {
				stack: string;
				mechanism: {
					type: "onerror" | "onunhandledrejection" | "instrument";
					handled: false;
				};
		  }
		| {
				manuallyWrittenSafeErrorMessage: string;
				mechanism: {
					type: "generic";
					handled: boolean;
				};
		  }
		| {
				message: string;
		  },
) => {
	try {
		if (!sentryIngest) {
			return;
		}

		const eventPayload =
			"message" in event ?
				{
					level: "info",
					message: event.message,
				}
			:	{
					level: "error",
					exception: {
						values: [
							{
								type:
									"stack" in event ?
										ERROR_TYPES.find((errorType_) =>
											event.stack.startsWith(`${errorType_}:`),
										) || "Error"
									:	"Error",
								value:
									"stack" in event ?
										"[Redacted error message]"
									:	event.manuallyWrittenSafeErrorMessage,
								mechanism: event.mechanism,
							},
						],
					},
				};

		fetch(getUrl(sentryIngest), {
			method: "POST",
			mode: "cors",
			credentials: "omit",
			referrerPolicy: "origin",
			body:
				JSON.stringify({
					sent_at: new Date().toISOString(),
					sdk: { name: "sentry.javascript.react", version: "7.105.0" },
				}) +
				"\n" +
				JSON.stringify({ type: "event" }) +
				"\n" +
				JSON.stringify({
					...eventPayload,
					platform: "javascript",
					timestamp: Date.now() / 1000,
					environment: import.meta.env.VITE_ENVIRONMENT,
					release: import.meta.env.VITE_APP_VERSION,
					tags: { appMode },
					request: {
						url: redactUrl(location.href),
						headers: {
							Referer:
								document.referrer.includes(location.host) ?
									redactUrl(document.referrer)
								:	document.referrer.split("?")[0].split("#")[0],
							"User-Agent": navigator.userAgent,
						},
					},
				}),
		});
	} catch {
		//
	}
};

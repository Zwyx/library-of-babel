export const domain = import.meta.env.VITE_DOMAIN;

export const pwa =
	document.referrer.startsWith("android-app://") ? "twa"
	: window.matchMedia("(display-mode: standalone)").matches ? "standalone"
	: "browser";

const SAFE_PATHNAMES = ["/", "/intro", "/browse", "/search", "/random"];

const TRANSFORM_PATHNAMES = [
	[
		/^(https?:\/\/[^/]+\/[0-9a-f]{2})[0-9a-f]{16}#[0-9A-Za-z-_]+$/,
		"(redacted-id-and-key)",
	],
	[/^(https?:\/\/[^/]+\/[0-9a-f]{2})[0-9a-f]{16}$/, "(redacted-id-only)"],
	[
		/^(https?:\/\/[^/]+\/[0-9a-f]{2})[0-9a-f]{16}?delete#[0-9a-f]+$/,
		"(redacted-id-and-delete-token)",
	],
];

export const redactUrl = (url: string) => {
	const origin = location.origin;

	for (let i = 0; i < SAFE_PATHNAMES.length; i++) {
		const safeUrl = origin + SAFE_PATHNAMES[i];

		if (url === safeUrl) {
			return safeUrl;
		}
	}

	for (let i = 0; i < TRANSFORM_PATHNAMES.length; i++) {
		const match = url.match(TRANSFORM_PATHNAMES[i][0]);

		if (match) {
			return match[1] + TRANSFORM_PATHNAMES[i][1];
		}
	}

	return origin + "/(redacted-unknown)";
};

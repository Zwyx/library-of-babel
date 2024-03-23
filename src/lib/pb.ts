import { FetchErrorType } from "@/components/common/FetchError.const";
import { EncryptedData } from "./crypto";
import { sendToSentry } from "./sentry";
import { getUrl, sleep } from "./utils";

export const expiryDurations = [
	["1hour", "1 hour"],
	["1day", "1 day"],
	["1week", "1 week"],
	["1month", "1 month"],
	["1year", "1 year"],
	["never", "Never"],
] as const;
export const expiryDurationTypes = expiryDurations.map((e) => e[0]);
export const expiryDurationTexts = expiryDurations.map((e) => e[1]);
export type ExpiryDuration = (typeof expiryDurationTypes)[number];

interface PbCommonBody {
	/** Version number */
	v: 2;

	/**
	 * - `adata[0][0]` → iv
	 * - `adata[3]` → delete after first access
	 * - rest is unused
	 */
	adata: [
		[string, "YmFiZWw=", 100000, 256, 128, "aes", "gcm", "none"],
		"plaintext",
		0,
		0 | 1,
	];

	/** Cypher text */
	ct: string;
}

interface PbSendRequestBody extends PbCommonBody {
	meta: {
		expire: ExpiryDuration;
	};
}

type PbSendResponseBody =
	| {
			status: 0;
			id: string;
			deletetoken: string;
	  }
	| {
			status: 1;
			message: string;
	  };

type PbGetResponseBody =
	| ({
			status: 0;
			meta: {
				created: number;
				time_to_live: number;
			};
	  } & PbCommonBody)
	| {
			status: 1;
			message: string;
	  };

let pbInstances: string[] = [];

// Cannot be done directly when this file is loaded, as we have to wait for Sentry to be initialised
const loadPbInstances = () => {
	try {
		pbInstances = JSON.parse(import.meta.env.VITE_PB_INSTANCES);

		if (!Array.isArray(pbInstances)) {
			throw Error("VITE_PB_INSTANCES is not an array");
		}

		pbInstances.forEach((pbInstance) => {
			if (typeof pbInstance !== "string") {
				throw Error("VITE_PB_INSTANCES contains a non-string value");
			}
		});
	} catch (err) {
		const { name, message } = err as Error;

		sendToSentry({
			manuallyWrittenSafeErrorMessage: `Invalid json data for PB instances: ${name} - ${message}`,
			mechanism: { type: "generic", handled: true },
		});

		return;
	}

	if (!Array.isArray(pbInstances) || !pbInstances.length) {
		sendToSentry({
			manuallyWrittenSafeErrorMessage: "Invalid data for PB instances.",
			mechanism: { type: "generic", handled: true },
		});
	}
};

const RETRIES_PER_INSTANCE = 3;

export const PB_ID_REGEX = /^[0-9a-f]{18}$/;

export const sendToPb = async (
	{
		encryptedData,
		expiry,
		deleteAfterFirstAccess,
	}: {
		encryptedData: EncryptedData;
		expiry: ExpiryDuration;
		deleteAfterFirstAccess: boolean;
	},
	onUploadProgress: (progress: Progress) => void,
): Promise<
	| {
			id: string;
			deleteToken: string;
	  }
	| { error: FetchErrorType }
> => {
	loadPbInstances();

	const pbRequestBody: PbSendRequestBody = {
		v: 2,
		adata: [
			[
				encryptedData.ivBase64,
				"YmFiZWw=",
				100000,
				256,
				128,
				"aes",
				"gcm",
				"none",
			],
			"plaintext",
			0,
			deleteAfterFirstAccess ? 1 : 0,
		],
		ct: encryptedData.ciphertextBase64,
		meta: { expire: expiry },
	};

	const requestOptions: RequestOptions = {
		method: "post",
		headers: { "x-requested-with": "JSONHttpRequest" },
		body: JSON.stringify(pbRequestBody),
	};

	const json = await sendWithRetry(requestOptions, onUploadProgress);

	if (!json) {
		return { error: "network-error" };
	}

	if (json.status !== 0) {
		return { error: "server-error" };
	}

	return {
		id: `${json.instanceIndex.toString(16)}${deleteAfterFirstAccess ? "1" : "0"}${json.id}`,
		deleteToken: json.deletetoken,
	};
};

const sendWithRetry = async (
	options: RequestOptions,
	onUploadProgress: (progress: Progress) => void,
	instanceIndex: number = 0,
): Promise<
	| ({
			instanceIndex: number;
	  } & PbSendResponseBody)
	| null
> => {
	const instance = pbInstances[instanceIndex];

	const json = await requestWithRetry<PbSendResponseBody>(
		getUrl(instance),
		options,
		{ onUploadProgress },
	);

	if (!json || json.status !== 0) {
		// We want `!== 0`, not `=== 1`, in case `status` can have other values
		if (json && (json?.status as number) !== 0) {
			sendToSentry({
				manuallyWrittenSafeErrorMessage: `PB server error: instance ${instanceIndex} - ${json.message}`,
				mechanism: { type: "generic", handled: true },
			});
		}

		if (instanceIndex < pbInstances.length - 1) {
			return sendWithRetry(options, onUploadProgress, instanceIndex + 1);
		}

		if (!json) {
			return null;
		}
	}

	return { ...json, instanceIndex };
};

export const getFromPb = async (
	id: string,
	onDownloadProgress: (progress: Progress) => void,
): Promise<
	| {
			ivBase64: string;
			ciphertextBase64: string;
	  }
	| { error: FetchErrorType }
> => {
	loadPbInstances();

	const instanceIndex = parseInt(id.slice(0, 1), 16);
	const instance = pbInstances[instanceIndex];

	const requestOptions: RequestOptions = {
		headers: { "x-requested-with": "JSONHttpRequest" },
	};

	const json = await requestWithRetry<PbGetResponseBody>(
		`${getUrl(instance)}/?pasteid=${id.slice(2)}`,
		requestOptions,
		{ onDownloadProgress },
	);

	if (!json) {
		return { error: "network-error" };
	}

	if (json.status !== 0) {
		if (
			json.message === "Paste does not exist, has expired or has been deleted."
		) {
			return { error: "not-found" };
		}

		return { error: "server-error" };
	}

	return {
		ivBase64: json.adata[0][0],
		ciphertextBase64: json.ct,
	};
};

interface RequestOptions {
	method?: RequestInit["method"];
	headers?: Record<string, string>;
	body?: string;
}

export interface Progress {
	loaded: number;
	total: number;
}

const requestWithRetry = async <T>(
	url: string,
	options?: RequestOptions,
	progressCallbacks?: {
		onUploadProgress?: (progress: Progress) => void;
		onDownloadProgress?: (progress: Progress) => void;
	},
	retries: number = 0,
): Promise<T | null> => {
	if (retries) {
		await sleep(2000);
	}

	const onError = () =>
		retries < RETRIES_PER_INSTANCE - 1 ?
			requestWithRetry<T>(url, options, progressCallbacks, retries + 1)
		:	null;

	// I put the try-catch in place when using fetch, it looks like it isn't
	// necessary with XHR, but let's leave it anyway
	try {
		const xhr = new XMLHttpRequest();

		xhr.open(options?.method || "GET", url);

		Object.entries(options?.headers || {}).forEach(([name, value]) =>
			xhr.setRequestHeader(name, value),
		);

		xhr.responseType = "json";

		if (progressCallbacks?.onUploadProgress) {
			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					progressCallbacks.onUploadProgress?.({
						loaded: e.loaded,
						total: e.total,
					});
				}
			});
		}

		if (progressCallbacks?.onDownloadProgress) {
			xhr.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					progressCallbacks.onDownloadProgress?.({
						loaded: e.loaded,
						total: e.total,
					});
				} else {
					const uncompressedContentLength = xhr.getResponseHeader(
						"X-Uncompressed-Content-Length",
					);

					if (uncompressedContentLength) {
						progressCallbacks.onDownloadProgress?.({
							loaded: e.loaded,
							total: Number(uncompressedContentLength),
						});
					}
				}
			});
		}

		await new Promise<void>((resolve) => {
			xhr.addEventListener("loadend", () => {
				// This is mainly useful for Firefox and other browsers that report the size of the
				// compressed data in `ProgressEvent.loaded`, therefore making the progress bar stop
				// about three quarter of the way; Chrome reports the size of the decompressed data
				// in `ProgressEvent.loaded`
				progressCallbacks?.onDownloadProgress?.({ loaded: 100, total: 100 });

				resolve();
			});

			xhr.send(options?.body);
		});

		if (xhr.readyState === 4 && xhr.status === 200) {
			return xhr.response;
		} else {
			return onError();
		}
	} catch {
		return onError();
	}
};

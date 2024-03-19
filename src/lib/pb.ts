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
	encryptedData: EncryptedData,
	expiry: ExpiryDuration,
	deleteAfterFirstAccess: boolean,
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

	const fetchOptions = {
		method: "post",
		headers: { "x-requested-with": "JSONHttpRequest" },
		body: JSON.stringify(pbRequestBody),
	};

	const json = await sendWithRetry(fetchOptions);

	if (!json) {
		return { error: "network-error" };
	}

	if (json.status !== 0) {
		sendToSentry({
			manuallyWrittenSafeErrorMessage: `PB server error: instance ${json.instanceIndex} - ${json.message}`,
			mechanism: { type: "generic", handled: true },
		});

		return { error: "server-error" };
	}

	return {
		id: `${json.instanceIndex.toString(16)}${deleteAfterFirstAccess ? "1" : "0"}${json.id}`,
		deleteToken: json.deletetoken,
	};
};

const sendWithRetry = async (
	options: RequestInit,
	instanceIndex: number = 0,
): Promise<
	| ({
			instanceIndex: number;
	  } & PbSendResponseBody)
	| null
> => {
	const instance = pbInstances[instanceIndex];

	const json = await fetchWithRetry<PbSendResponseBody>(
		getUrl(instance),
		options,
	);

	if (!json || json.status !== 0) {
		if (instanceIndex < pbInstances.length - 1) {
			return sendWithRetry(options, instanceIndex + 1);
		}

		if (!json) {
			return null;
		}
	}

	return { ...json, instanceIndex };
};

export const getFromPb = async (
	id: string,
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

	const fetchOptions = {
		headers: { "x-requested-with": "JSONHttpRequest" },
	};

	const json = await fetchWithRetry<PbGetResponseBody>(
		`${getUrl(instance)}/?pasteid=${id.slice(2)}`,
		fetchOptions,
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

const fetchWithRetry = async <T>(
	url: string,
	options?: RequestInit,
	retries: number = 0,
): Promise<T | null> => {
	const onError = () =>
		retries < RETRIES_PER_INSTANCE - 1 ?
			fetchWithRetry<T>(url, options, retries + 1)
		:	null;

	if (retries) {
		await sleep(2);
	}

	try {
		const res = await fetch(url, options);

		if (res.ok) {
			return (await res.json()) as T;
		} else {
			return onError();
		}
	} catch {
		return onError();
	}
};

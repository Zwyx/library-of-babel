import { EncryptedData } from "./crypto";
import { getInstance, sleep } from "./utils";

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

interface PbRequestBody {
	adata: [
		[string, "YmFiZWw=", 100000, 256, 128, "aes", "gcm", "none"],
		"plaintext",
		0,
		0 | 1,
	];
	meta: {
		expire: ExpiryDuration;
	};
	v: 2;
	ct: string;
}

interface PbResponseBody {
	id: string;
	deletetoken: string;
}

const RETRIES_PER_INSTANCE = 3;

export const sendToPb = async (
	encryptedData: EncryptedData,
	expiry: ExpiryDuration,
	deleteAfterFirstAccess: boolean,
): Promise<{
	instanceIndex: number;
	id: string;
	deleteToken: string;
} | null> => {
	const pbRequestBody: PbRequestBody = {
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
		meta: {
			expire: expiry,
		},
		v: 2,
		ct: encryptedData.ciphertextBase64,
	};

	const fetchOptions = {
		method: "post",
		headers: { "x-requested-with": "JSONHttpRequest" },
		body: JSON.stringify(pbRequestBody),
	};

	const res = await fetchWithRetry(fetchOptions, 0);

	console.log(res?.instanceIndex);
	console.log(res?.instanceIndex.toString(16));

	return res ?
			{
				instanceIndex: res.instanceIndex,
				id: `${res.instanceIndex.toString(16)}${deleteAfterFirstAccess ? "1" : "0"}${res.id}`,
				deleteToken: res.deletetoken,
			}
		:	null;
};

const fetchWithRetry = async (
	options: RequestInit,
	retries: number,
): Promise<(PbResponseBody & { instanceIndex: number }) | null> => {
	const urlIndex = Math.floor(retries / RETRIES_PER_INSTANCE);
	const url = PB_INSTANCES[urlIndex];

	const onError = () =>
		retries < PB_INSTANCES.length * RETRIES_PER_INSTANCE - 1 ?
			fetchWithRetry(options, retries + 1)
		:	null;

	if (retries) {
		await sleep(2);
	}

	try {
		const res = await fetch(`https://${getInstance(url)}`, options);

		if (res.ok) {
			const json = await res.json();
			return { instanceIndex: urlIndex, ...json };
		} else {
			return onError();
		}
	} catch {
		return onError();
	}
};

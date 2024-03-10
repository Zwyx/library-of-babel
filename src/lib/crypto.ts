import { fromBase64, toBase64 } from "./binary-base64";

const AES_GCM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export interface EncryptedData {
	ciphertextBase64: string;
	keyBase64Url: string;
	ivBase64: string;
}

export const encrypt = async (plaintext: string): Promise<EncryptedData> => {
	const key = await crypto.subtle.generateKey(
		{
			name: AES_GCM,
			length: KEY_LENGTH,
		} satisfies AesKeyGenParams,
		true,
		["encrypt"],
	);

	const plaintextEncoded = new TextEncoder().encode(plaintext);
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

	const ciphertext = await crypto.subtle.encrypt(
		{
			name: AES_GCM,
			iv,
		} satisfies AesGcmParams,
		key,
		plaintextEncoded,
	);

	const ciphertextBase64 = await toBase64(ciphertext);
	const keyPortable = await crypto.subtle.exportKey("raw", key);
	const keyBase64Url = await toBase64(keyPortable, "base64Url");
	const ivBase64 = await toBase64(iv);

	return { ciphertextBase64, keyBase64Url, ivBase64 };
};

export const decrypt = async ({
	ciphertextBase64,
	keyBase64Url,
	ivBase64,
}: EncryptedData): Promise<string> => {
	const ciphertext = await fromBase64(ciphertextBase64);

	const keyPortable = await fromBase64(keyBase64Url);

	const key = await crypto.subtle.importKey(
		"raw",
		keyPortable,
		AES_GCM,
		false,
		["decrypt"],
	);

	const iv = await fromBase64(ivBase64);

	const plaintext = await crypto.subtle.decrypt(
		{
			name: AES_GCM,
			iv,
		} satisfies AesGcmParams,
		key,
		ciphertext,
	);

	const plaintextDecoded = new TextDecoder().decode(plaintext);

	return plaintextDecoded;
};

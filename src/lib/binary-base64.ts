export const toBase64 = async (
	buffer: ArrayBuffer,
	mode: "base64" | "base64Url" = "base64",
): Promise<string> => {
	// The following also works but is 5-10 times slower
	// btoa(
	// 	Array.from(new Uint8Array(buffer), (byte) =>
	// 		String.fromCodePoint(byte),
	// 	).join(""),
	// );
	const base64 = (
		await new Promise<string>((resolve, reject) => {
			const fileReader = new FileReader();

			fileReader.onload = (e) =>
				typeof e.target?.result === "string" ?
					resolve(e.target.result)
				:	reject(Error("Error: result is not a string."));

			fileReader.readAsDataURL(
				new File([new Uint8Array(buffer)], "", {
					type: "application/octet-stream",
				}),
			);
		})
	).replace("data:application/octet-stream;base64,", "");

	return mode === "base64" ? base64 : (
			base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
		);
};

export const fromBase64 = async (rawBase64: string): Promise<ArrayBuffer> => {
	const lengthMod4 = rawBase64.length % 4;

	const paddingRequirement = lengthMod4 === 0 ? 0 : 4 - lengthMod4;

	if (paddingRequirement > 2) {
		throw Error("Invalid base64 string");
	}

	const base64 = rawBase64
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.concat("=".repeat(paddingRequirement));

	const res = await fetch(`data:application/octet-stream;base64,${base64}`);
	// The following also works but is a bit slower:
	// Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)).buffer;

	return await res.arrayBuffer();
};

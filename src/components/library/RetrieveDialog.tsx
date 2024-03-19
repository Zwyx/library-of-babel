import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ShareData } from "@/lib/common";
import { EncryptedData, decrypt } from "@/lib/crypto";
import { PB_ID_REGEX, getFromPb } from "@/lib/pb";
import { cn, sleep } from "@/lib/utils";
import { LucideAlertTriangle, LucideCheck, LucideLoader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FetchError } from "../common/FetchError";
import { FetchErrorType, isFetchErrorType } from "../common/FetchError.const";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * Note: do not place any `AboutDialogLink`s in this dialog, as clicking
 * them would remove the decryption key from a shared link
 */
export const RetrieveDialog = ({
	id,
	key_: key,
	navigateToHomeIfCancelled,
	onShareDataReady,
}: {
	id: string;
	key_?: string;
	/**
	 * Set to `true` if the user just arrived on the app, `false` if the dialog
	 * opens because the user clicked Previous in his browser
	 */
	navigateToHomeIfCancelled: boolean;
	onShareDataReady: (data: ShareData) => void;
}) => {
	const navigate = useNavigate();

	const firstRender = useRef<boolean>(true);
	const [open, setOpen] = useState<boolean>(true);

	const [view, setView] = useState<
		| "invalid-link"
		| "delete-confirmation"
		| "retrieving"
		| FetchErrorType
		| "key-input"
		| "wrong-key-input"
		| "decrypting"
		| "finished"
	>();

	const encryptedData = useRef<EncryptedData>();
	const [decryptionKey, setDecryptionKey] = useState<string>("");

	const decryptData = useCallback(async () => {
		if (!encryptedData.current) {
			return;
		}

		setView("decrypting");

		let shareData: ShareData;

		try {
			shareData = JSON.parse(await decrypt(encryptedData.current));
		} catch {
			setView("wrong-key-input");
			return;
		}

		await sleep(0.5);

		setView("finished");

		await sleep(0.5);

		onShareDataReady(shareData);
		setOpen(false);
	}, [onShareDataReady]);

	const retrieveData = useCallback(async () => {
		setView("retrieving");

		const json = await getFromPb(id);

		if ("error" in json) {
			setView(json.error);
		} else {
			encryptedData.current = {
				keyBase64Url: key || "",
				ivBase64: json.ivBase64,
				ciphertextBase64: json.ciphertextBase64,
			};

			if (!key) {
				setView("key-input");
			} else {
				decryptData();
			}
		}
	}, [decryptData, id, key]);

	useEffect(() => {
		// When `onShareDataReady` is called, the parent rerenders, which updates `onShareDataReady`,
		// which recreates `decryptData` then `retrieveData`, which triggers this `useEffect` (and also,
		// in dev, with React's strict mode, `useEffect` is triggered twice anyway), so this ensures
		// we don't unnecessarily retrieve the encrypted content multiple times
		if (!firstRender.current) {
			return;
		}

		firstRender.current = false;

		if (!PB_ID_REGEX.test(id)) {
			setView("invalid-link");
		} else if (id.slice(1, 2) === "1") {
			setView("delete-confirmation");
		} else {
			retrieveData();
		}
	}, [id, retrieveData]);

	return (
		<Dialog open={open}>
			<DialogContent
				className="max-h-full max-w-xl gap-0 overflow-auto"
				notClosable
			>
				<DialogHeader>
					<DialogTitle>Retrieve a shared book</DialogTitle>

					<DialogDescription>
						Sharing books uses end-to-end encryption.
					</DialogDescription>
				</DialogHeader>

				{view === "invalid-link" && (
					<div className="my-6 flex flex-col gap-2 text-center text-destructive">
						<div className="font-semibold">Error</div>
						The provided link is invalid.
					</div>
				)}

				{view === "delete-confirmation" && (
					<>
						<Alert className="mt-6 max-w-[750px]" variant="warning">
							<LucideAlertTriangle className="h-4 w-4" />

							<AlertTitle>
								One time link{!key && " with separate decryption key"}
							</AlertTitle>

							<AlertDescription>
								<ul
									className={cn(
										"list-inside",
										!key && "ml-4 list-disc pl-4 indent-[-1.15rem]",
									)}
								>
									<li>
										The book shared with this link can be retrieved only once.
										It will be deleted once retrieved and only viewable on your
										device, until you navigate away.
									</li>

									{!key && (
										<li>
											Also, the link does not include the decryption key. Make
											sure you have the decryption ready before clicking the
											Confirm button.
										</li>
									)}
								</ul>
							</AlertDescription>
						</Alert>

						<Button
							className="mt-6 sm:mx-auto sm:w-fit"
							variant="destructive"
							onClick={retrieveData}
						>
							Confirm retrieval and deletion
						</Button>
					</>
				)}

				{(view === "retrieving" ||
					view === "decrypting" ||
					view === "finished") && (
					<div className="mt-6 flex flex-col items-center gap-2 py-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<span>Retrieving data</span>

							{view === "retrieving" ?
								<LucideLoader2 className="h-4 w-4 animate-spin text-blue-500" />
							:	<LucideCheck className="h-4 w-4 text-green-500" />}
						</div>

						<div className="flex items-center gap-2">
							<span
								className={cn(
									view !== "decrypting" && view !== "finished" && "text-muted",
								)}
							>
								Decrypting
							</span>

							{view === "decrypting" && (
								<LucideLoader2 className="h-4 w-4 animate-spin text-blue-500" />
							)}

							{view === "finished" && (
								<LucideCheck className="h-4 w-4 text-green-500" />
							)}
						</div>
					</div>
				)}

				{isFetchErrorType(view) && (
					<FetchError
						className="mt-6"
						type={view}
						onRetryClick={retrieveData}
					/>
				)}

				{(view === "key-input" || view === "wrong-key-input") && (
					<>
						<Label className="mt-6" htmlFor="decryption-key">
							Decryption key
						</Label>

						<Input
							className="mt-2"
							id="decryption-key"
							// eslint-disable-next-line jsx-a11y/no-autofocus -- usefull in this case
							autoFocus
							spellCheck={false}
							autoComplete="off"
							value={decryptionKey}
							onChange={(e) => setDecryptionKey(e.target.value)}
						/>

						<Button
							className="mt-6 sm:mx-auto sm:w-fit"
							disabled={!decryptionKey}
							onClick={() => {
								if (!encryptedData.current) {
									return;
								}

								encryptedData.current.keyBase64Url = decryptionKey;

								decryptData();
							}}
						>
							Decrypt
						</Button>
					</>
				)}

				<DialogFooter className="mt-6">
					<DialogClose asChild>
						<Button
							variant="secondary"
							disabled={
								view === "retrieving" ||
								view === "decrypting" ||
								view === "finished"
							}
							onClick={() =>
								navigateToHomeIfCancelled ? navigate("/") : setOpen(false)
							}
						>
							{(
								view === "delete-confirmation" ||
								view === "retrieving" ||
								view === "network-error" ||
								view === "key-input" ||
								view === "wrong-key-input" ||
								view === "decrypting" ||
								view === "finished"
							) ?
								"Cancel"
							:	"Close"}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

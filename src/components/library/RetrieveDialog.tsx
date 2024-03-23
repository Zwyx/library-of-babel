import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ShareData } from "@/lib/common";
import { EncryptedData, decrypt } from "@/lib/crypto";
import { PB_ID_REGEX, Progress, getFromPb } from "@/lib/pb";
import { cn, sleep } from "@/lib/utils";
import {
	LucideAlertOctagon,
	LucideAlertTriangle,
	LucideCheck,
	LucideLoader2,
	LucideMinus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FetchError } from "../common/FetchError";
import { FetchErrorType, isFetchErrorType } from "../common/FetchError.const";
import { ProgressStatus } from "../common/ProgressStatus";
import { SmallAlert } from "../common/SmallAlert";
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
	const [decryptionCancelDialogOpen, setDecryptionCancelDialogOpen] =
		useState<boolean>(false);

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
	const [downloadProgress, setDownloadProgress] = useState<Progress>();

	const onetimeLink = id.slice(1, 2) === "1";

	const decryptData = useCallback(async () => {
		if (!encryptedData.current) {
			return;
		}

		setView("decrypting");

		await sleep(750);

		let shareData: ShareData;

		try {
			shareData = JSON.parse(await decrypt(encryptedData.current));
		} catch {
			setView("wrong-key-input");
			return;
		}

		setView("finished");

		await sleep(250);

		onShareDataReady(shareData);
		setOpen(false);
	}, [onShareDataReady]);

	const retrieveData = useCallback(async () => {
		setView("retrieving");

		const json = await getFromPb(id, setDownloadProgress);

		if ("error" in json) {
			setView(json.error);
		} else {
			encryptedData.current = {
				keyBase64Url: key || "",
				ivBase64: json.ivBase64,
				ciphertextBase64: json.ciphertextBase64,
			};

			await sleep(250);

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
		} else if (onetimeLink) {
			setView("delete-confirmation");
		} else {
			retrieveData();
		}
	}, [id, onetimeLink, retrieveData]);

	const onDecryptClick = () => {
		if (!encryptedData.current) {
			return;
		}

		encryptedData.current.keyBase64Url = decryptionKey;

		decryptData();
	};

	const closeDialogs = () => {
		if (navigateToHomeIfCancelled) {
			navigate("/");
		} else {
			setOpen(false);
			setDecryptionCancelDialogOpen(false);
		}
	};

	return (
		<>
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
							<Alert className="mt-6" variant="warning">
								<LucideAlertTriangle className="h-4 w-4" />

								<AlertTitle>
									One-time link{!key && " with separate decryption key"}
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
											It will be deleted once retrieved and only viewable on
											your device, until you navigate away.
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
								<span>Retrieving encrypted data</span>

								{view === "retrieving" ?
									<LucideLoader2 className="h-4 w-4 animate-spin text-info-dim" />
								:	<LucideCheck className="h-4 w-4 text-success-dim" />}
							</div>

							<ProgressStatus className="my-1" progress={downloadProgress} />

							<div className="flex items-center gap-2">
								<span
									className={cn(
										view !== "decrypting" &&
											view !== "finished" &&
											"text-muted-text",
									)}
								>
									Decrypting
								</span>

								{view === "decrypting" ?
									<LucideLoader2 className="h-4 w-4 animate-spin text-info-dim" />
								: view === "finished" ?
									<LucideCheck className="h-4 w-4 text-success-dim" />
								:	<LucideMinus className="h-4 w-4 text-muted-text" />}
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
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										onDecryptClick();
									}
								}}
							/>

							{view === "wrong-key-input" && (
								<SmallAlert className="mt-4">
									Decryption failed. Please check the key.
								</SmallAlert>
							)}

							<Button
								className="mt-6 sm:mx-auto sm:w-fit"
								disabled={!decryptionKey}
								onClick={onDecryptClick}
							>
								Decrypt
							</Button>
						</>
					)}

					<DialogFooter className="mt-6">
						<Button
							variant="secondary"
							disabled={
								view === "retrieving" ||
								view === "decrypting" ||
								view === "finished"
							}
							onClick={() =>
								(
									onetimeLink &&
									(view === "key-input" || view === "wrong-key-input")
								) ?
									setDecryptionCancelDialogOpen(true)
								:	closeDialogs()
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
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={decryptionCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					</AlertDialogHeader>

					<Alert variant="destructive">
						<LucideAlertOctagon className="h-4 w-4" />

						<AlertTitle>This book will be lost</AlertTitle>

						<AlertDescription>
							The encrypted data of this one-time link has been retrieved and
							deleted. Cancelling the decryption process now will make this
							shared book irretrievable.
						</AlertDescription>
					</Alert>

					<AlertDialogFooter className="sm:flex sm:flex-col-reverse sm:space-x-0">
						<AlertDialogCancel
							className="sm:mt-2"
							onClick={() => setDecryptionCancelDialogOpen(false)}
						>
							Go back to the decryption process
						</AlertDialogCancel>

						<Button variant="destructive" asChild>
							<AlertDialogAction className="sm:mt-2" onClick={closeDialogs}>
								I understand, loose this book forever
							</AlertDialogAction>
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

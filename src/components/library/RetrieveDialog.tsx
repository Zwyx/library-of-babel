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
import { usePwaContext } from "@/lib/PwaContext.const";
import { ShareData, isLibraryMode } from "@/lib/common";
import { EncryptedData, decrypt } from "@/lib/crypto";
import { LAST_LIBRARY_MODE_KEY } from "@/lib/local-storage-keys";
import { PB_ID_REGEX, Progress, getFromPb } from "@/lib/pb";
import { cn, sleep } from "@/lib/utils";
import { LucideAlertOctagon, LucideAlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	OperationStatus,
	OperationStatusGroup,
} from "../common/OperationStatus";
import { ProgressStatus } from "../common/ProgressStatus";
import { RequestError } from "../common/RequestError";
import {
	RequestErrorType,
	isRequestErrorType,
} from "../common/RequestError.const";
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
	navigateHomeIfCancelled,
	onShareDataReady,
}: {
	id: string;
	key_?: string;
	/** Set to `true` if the user just arrived on the app, `false` otherwise */
	navigateHomeIfCancelled: boolean;
	onShareDataReady: (data: ShareData) => void;
}) => {
	const navigate = useNavigate();
	const { update, needsRefresh, refresh } = usePwaContext();

	const firstRender = useRef<boolean>(true);
	const [open, setOpen] = useState<boolean>(true);
	const [decryptionCancelDialogOpen, setDecryptionCancelDialogOpen] =
		useState<boolean>(false);

	const [view, setView] = useState<
		| "welcome"
		| "invalid-link"
		| "app-version-check"
		| "delete-confirmation"
		| "retrieving"
		| RequestErrorType
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
		localStorage.setItem(LAST_LIBRARY_MODE_KEY, "browse");
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

	const checkData = useCallback(() => {
		if (!PB_ID_REGEX.test(id)) {
			setView("invalid-link");
		} else if (onetimeLink) {
			setView("app-version-check");
		} else {
			retrieveData();
		}
	}, [id, onetimeLink, retrieveData]);

	useEffect(() => {
		// When `onShareDataReady` is called, the parent rerenders, which updates `onShareDataReady`,
		// which recreates `decryptData` then `retrieveData`, which triggers this `useEffect` (and also,
		// in dev, with React's strict mode, `useEffect` is triggered twice anyway), so this ensures
		// we don't unnecessarily retrieve the encrypted content multiple times
		if (!firstRender.current) {
			return;
		}

		firstRender.current = false;

		const lastLibraryMode = localStorage.getItem(LAST_LIBRARY_MODE_KEY);

		if (!isLibraryMode(lastLibraryMode)) {
			setView("welcome");
		} else {
			checkData();
		}
	}, [checkData]);

	useEffect(() => {
		if (view === "app-version-check" && update) {
			update().then(() =>
				// I'm not really happy with this potential race condition,
				// but I haven't found a way to use the object returned by `update`
				// to know if a new version is available
				setTimeout(() => setView("delete-confirmation"), 5000),
			);
		}
	}, [view, update]);

	useEffect(() => {
		if (
			(view === "app-version-check" || view === "delete-confirmation") &&
			needsRefresh &&
			refresh
		) {
			setTimeout(refresh, view === "app-version-check" ? 1000 : 0);
		}
	}, [view, needsRefresh, refresh]);

	const onDecryptClick = () => {
		if (!encryptedData.current) {
			return;
		}

		encryptedData.current.keyBase64Url = decryptionKey;

		decryptData();
	};

	const closeDialogs = () => {
		if (navigateHomeIfCancelled) {
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
					{view !== "welcome" && (
						<DialogHeader>
							<DialogTitle>Retrieve a shared book</DialogTitle>

							<DialogDescription>
								Sharing books uses end-to-end encryption.
							</DialogDescription>
						</DialogHeader>
					)}

					{view === "welcome" && (
						<>
							<div className="mb-2 mt-2 text-center">
								<h1 className="text-xl font-semibold">Welcome, visitor</h1>

								<p className="mt-6">
									You are about to retrieve a book from the Library of Babel.
								</p>

								<p className="mt-4">
									The Library of Babel contains <em>all the books</em>. Every
									book{" "}
									<em>
										that has <strong>ever been</strong> written
									</em>
									. Every book{" "}
									<em>
										that will <strong>ever be</strong> written
									</em>
									. And the vast majority of books{" "}
									<em>
										that will <strong>never be</strong> written
									</em>
									.
								</p>

								<p className="mt-4">
									Each book contains 410 pages. Each page, 40 lines. Each line,
									80 characters. Each character can be a space, a letter, a
									comma, or a period.
								</p>

								<p className="mt-4">
									The number of atoms in the observable Universe is estimated to
									be a number with <strong>80 digits</strong>. There are 29
									<sup>1,312,000</sup> books in the Library of Babel — a number
									with <strong>1,918,667 digits</strong>.
								</p>

								<p className="mt-4">They are all available here.</p>

								<Button className="mt-6" onClick={checkData}>
									Retrieve your book
								</Button>
							</div>
						</>
					)}

					{view === "invalid-link" && (
						<div className="my-6 flex flex-col gap-2 text-center text-destructive">
							<div className="font-semibold">Error</div>
							The link provided is invalid.
						</div>
					)}

					{(view === "app-version-check" || view === "delete-confirmation") && (
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

							<OperationStatusGroup className="mt-2">
								<OperationStatus
									label={
										needsRefresh ? "New version available, updating"
										: view === "app-version-check" ?
											"Checking for new app version"
										:	"Your app is up to date"
									}
									status={
										view === "app-version-check" || needsRefresh ?
											"running"
										:	"success"
									}
								/>
							</OperationStatusGroup>

							<Button
								className="mt-2 sm:mx-auto sm:w-fit"
								variant="destructive"
								disabled={view !== "delete-confirmation" || needsRefresh}
								onClick={retrieveData}
							>
								Confirm retrieval and deletion
							</Button>
						</>
					)}

					{(view === "retrieving" ||
						view === "decrypting" ||
						view === "finished") && (
						<OperationStatusGroup className="mt-6">
							<OperationStatus
								label="Retrieving encrypted data"
								status={view === "retrieving" ? "running" : "success"}
							/>

							<ProgressStatus className="my-1" progress={downloadProgress} />

							<OperationStatus
								label="Decrypting"
								status={
									view === "decrypting" ? "running"
									: view === "finished" ?
										"success"
									:	"idle"
								}
							/>
						</OperationStatusGroup>
					)}

					{isRequestErrorType(view) && (
						<RequestError
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
								// eslint-disable-next-line jsx-a11y/no-autofocus -- useful in this case
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

					{view !== "welcome" && (
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
									view === "app-version-check" ||
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
					)}
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
							The encrypted data associated to this one-time link has been
							retrieved and deleted. Cancelling the decryption process now will
							make this shared book irretrievable.
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

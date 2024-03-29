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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BookMetadata, Selection, ShareData } from "@/lib/common";
import { encrypt } from "@/lib/crypto";
import { ExpiryDuration, Progress, expiryDurations, sendToPb } from "@/lib/pb";
import { LucideInfo } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonLoading } from "../common/ButtonLoading";
import { LinkCopy } from "../common/LinkCopy";
import { ProgressStatus } from "../common/ProgressStatus";
import { RequestError } from "../common/RequestError";
import {
	RequestErrorType,
	isRequestErrorType,
} from "../common/RequestError.const";
import { SourceChangedAlert } from "../common/SourceChangedAlert";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { AboutDialogLink } from "./about/AboutDialog";

const INCLUDE_SEARCH_TEXT_SELECTION_ID = "include-search-text-selection";
const INCLUDE_CURRENT_PAGE_NUMBER_ID = "include-current-page-number";
const DELETE_AFTER_FIRST_ACCESS_ID = "delete-after-first-access";

interface LinksData {
	id: string;
	key: string;
	deleteToken: string;
}

export const ShareDialog = ({
	bookMetadata,
	pageNumber,
	selection,
	open,
	bookIdChanged,
	bookImageChanged,
	searchTextChanged,
	onOpenChange,
}: {
	bookMetadata?: BookMetadata;
	pageNumber: number;
	selection: Selection | undefined;
	bookIdChanged: boolean;
	bookImageChanged: boolean;
	searchTextChanged: boolean;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const [view, setView] = useState<"form" | "links" | RequestErrorType>("form");

	const [includeSearchTextSelection, setIncludeSearchTextSelection] =
		useState<boolean>(true);
	const [includeCurrentPageNumber, setIncludeCurrentPageNumber] =
		useState<boolean>(true);
	const [expiry, setExpiry] = useState<ExpiryDuration>("1month");
	const [deleteAfterFirstAccess, setDeleteAfterFirstAccess] =
		useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);
	const [uploadProgress, setUploadProgress] = useState<Progress>();
	const [requestTooLong, setRequestTooLong] = useState<boolean>(false);

	const [linkData, setLinksData] = useState<LinksData>();
	const [sendDecryptionKeySeparately, setSendDecryptionKeySeparately] =
		useState<boolean>(false);

	const showIncludeSearchTextSelection = selection?.end !== null;

	useEffect(() => {
		setView("form");
		setLinksData(undefined);
		setSendDecryptionKeySeparately(false);

		if (showIncludeSearchTextSelection) {
			setIncludeSearchTextSelection(true);
			setIncludeCurrentPageNumber(false);
		} else {
			setIncludeCurrentPageNumber(true);
		}

		setExpiry("1month");
		setDeleteAfterFirstAccess(false);
		setUploadProgress(undefined);
		setRequestTooLong(false);
	}, [bookMetadata, showIncludeSearchTextSelection]);

	const getLink = async () => {
		if (!bookMetadata) {
			return;
		}

		setLoading(true);

		const shareData: ShareData = {
			bookId: bookMetadata.bookId,
			...(includeCurrentPageNumber && { pageNumber }),
			...(includeSearchTextSelection && { selection }),
		};

		const encryptedData = await encrypt(JSON.stringify(shareData));

		const json = await sendToPb(
			{
				encryptedData,
				expiry,
				deleteAfterFirstAccess,
			},
			setUploadProgress,
			() => setRequestTooLong(true),
		);

		setLoading(false);

		if ("error" in json) {
			setView(json.error);
			return;
		}

		setLinksData({
			id: json.id,
			key: encryptedData.keyBase64Url,
			deleteToken: json.deleteToken,
		});

		setView("links");
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				if (!loading) {
					if (
						!newOpen &&
						(view === "network-error" || view === "server-error")
					) {
						// To prevent a flash of the form while the dialog closes
						setTimeout(() => {
							setView("form");
							setUploadProgress(undefined);
							setRequestTooLong(false);
						}, 250);
					}

					onOpenChange(newOpen);
				}
			}}
		>
			<DialogContent
				className="max-h-full max-w-xl gap-0 overflow-auto"
				notClosable={loading}
			>
				<DialogHeader>
					<DialogTitle>Share</DialogTitle>

					<DialogDescription>
						Get a shareable link to the current book. Uses{" "}
						<AboutDialogLink to="?about=privacy">
							end-to-end encryption
						</AboutDialogLink>
						.
					</DialogDescription>

					<SourceChangedAlert
						bookIdChanged={bookIdChanged}
						bookImageChanged={bookImageChanged}
						searchTextChanged={searchTextChanged}
					/>
				</DialogHeader>

				{view === "form" && (
					<>
						{showIncludeSearchTextSelection ?
							<div className="mt-6 flex items-center gap-2">
								<Checkbox
									id={INCLUDE_SEARCH_TEXT_SELECTION_ID}
									checked={includeSearchTextSelection}
									disabled={loading}
									onCheckedChange={(newChecked) => {
										setIncludeSearchTextSelection(!!newChecked);

										if (newChecked) {
											setIncludeCurrentPageNumber(false);
										}
									}}
								/>

								<Label htmlFor={INCLUDE_SEARCH_TEXT_SELECTION_ID}>
									Include the search text selection
								</Label>
							</div>
						:	<div className="mt-3" />}

						<div className="mt-3 flex items-center gap-2">
							<Checkbox
								id={INCLUDE_CURRENT_PAGE_NUMBER_ID}
								checked={includeCurrentPageNumber}
								disabled={
									(showIncludeSearchTextSelection &&
										includeSearchTextSelection) ||
									loading
								}
								onCheckedChange={(newChecked) =>
									setIncludeCurrentPageNumber(!!newChecked)
								}
							/>

							<Label htmlFor={INCLUDE_CURRENT_PAGE_NUMBER_ID}>
								Include the current page number
							</Label>

							{showIncludeSearchTextSelection && includeSearchTextSelection && (
								<Popover>
									<PopoverTrigger>
										<LucideInfo size={16} />
									</PopoverTrigger>
									<PopoverContent className="text-center">
										This option is disabled, because it's the page number of the
										searched text which will be included.
									</PopoverContent>
								</Popover>
							)}
						</div>

						<div className="mt-5">
							<Select
								value={expiry}
								disabled={loading}
								onValueChange={(newValue) =>
									setExpiry(newValue as ExpiryDuration)
								}
							>
								<SelectTrigger className="max-w-[250px]">
									<SelectValue>
										Expires: {expiry.startsWith("1") && "after "}
										{expiryDurations.find(([type]) => type === expiry)?.[1]}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{expiryDurations.map(([type, text]) => (
										<SelectItem key={type} value={type}>
											{text}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="mt-5 flex gap-2">
							<Checkbox
								className="mt-0.5"
								id={DELETE_AFTER_FIRST_ACCESS_ID}
								checked={deleteAfterFirstAccess}
								disabled={loading}
								onCheckedChange={(newChecked) =>
									setDeleteAfterFirstAccess(!!newChecked)
								}
							/>

							<Label className="text-sm" htmlFor={DELETE_AFTER_FIRST_ACCESS_ID}>
								<div className="font-medium">Delete after the first access</div>
								<div className="mt-0.5 font-normal text-muted-foreground">
									Makes the book retrievable only once.
								</div>
							</Label>
						</div>

						<ProgressStatus className="mt-4" progress={uploadProgress} />

						{requestTooLong && !uploadProgress?.loaded && (
							<span className="text-center text-sm">
								Hm... it seems longer than usual, please keep waiting...
							</span>
						)}

						<ButtonLoading className="mt-2" loading={loading} onClick={getLink}>
							Get link
						</ButtonLoading>
					</>
				)}

				{view === "links" && linkData && (
					<>
						<div className="mt-6 font-semibold">Access link</div>

						<div className="text-sm text-muted-foreground">
							Anyone with this link will be able to access the current book.
						</div>

						<div className="mt-5 flex items-center gap-2">
							<Label
								className="flex-1"
								htmlFor="send-decryption-key-separately"
							>
								Send decryption key separately
							</Label>
							<Switch
								id="send-decryption-key-separately"
								onCheckedChange={setSendDecryptionKeySeparately}
							/>
						</div>

						<LinkCopy
							className="mt-4"
							link={`${location.origin}/${linkData.id}${sendDecryptionKeySeparately ? "" : `#${linkData.key}`}`}
							buttonLabel="Copy link"
						/>

						{sendDecryptionKeySeparately && (
							<LinkCopy
								className="mt-2"
								link={linkData.key}
								buttonLabel="Copy key"
							/>
						)}

						<div className="mt-6 font-semibold">Deletion link</div>

						<div className="text-sm text-muted-foreground">
							Use this link to render the access link unusable.
						</div>

						<LinkCopy
							className="mt-5"
							link={`${location.origin}/${linkData?.id}?delete#${linkData.deleteToken}`}
							buttonLabel="Copy deletion link"
						/>
					</>
				)}

				{isRequestErrorType(view) && (
					<RequestError
						className="mt-6"
						type={view}
						loading={loading}
						onRetryClick={getLink}
					/>
				)}

				<DialogFooter className="mt-6">
					<DialogClose asChild>
						<Button variant="secondary" disabled={loading}>
							{view === "form" ? "Cancel" : "Close"}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

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
import { BookMetadata } from "@/lib/common";
import { encrypt } from "@/lib/crypto";
import { ExpiryDuration, expiryDurationTexts, sendToPb } from "@/lib/pb";
import { LucideInfo } from "lucide-react";
import { useEffect, useState } from "react";
import { LinkCopy } from "../LinkCopy";
import { ButtonLoading } from "../common/ButtonLoading";
import { SourceChangedAlert } from "../common/SourceChangedAlert";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { AboutDialogLink } from "./about/AboutDialog";

const INCLUDE_SEARCH_TEXT_SELECTION_ID = "include-search-text-selection";
const INCLUDE_CURRENT_PAGE_NUMBER_ID = "include-current-page-number";
const DELETE_AFTER_FIRST_ACCESS_ID = "delete-after-first-access";

interface LinksData {
	instanceIndex: number;
	deleteAfterFirstAccess: boolean;
	id: string;
	key: string;
	deleteToken: string;
}

export const ShareDialog = ({
	bookMetadata,
	pageNumber,
	searchTextStart,
	searchTextEnd,
	open,
	bookIdChanged,
	bookImageChanged,
	searchTextChanged,
	onOpenChange,
}: {
	bookMetadata?: BookMetadata;
	pageNumber: number;
	searchTextStart: number | undefined;
	searchTextEnd: number | undefined;
	bookIdChanged: boolean;
	bookImageChanged: boolean;
	searchTextChanged: boolean;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const [view, setView] = useState<"form" | "links" | "error">("form");

	const [includeSearchTextSelection, setIncludeSearchTextSelection] =
		useState<boolean>(true);
	const [includeCurrentPageNumber, setIncludeCurrentPageNumber] =
		useState<boolean>(true);
	const [expiry, setExpiry] = useState<ExpiryDuration>("1month");
	const [deleteAfterFirstAccess, setDeleteAfterFirstAccess] =
		useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);

	const [linkData, setLinksData] = useState<LinksData>();
	const [sendDecryptionKeySeparately, setSendDecryptionKeySeparately] =
		useState<boolean>(false);

	const showIncludeSearchTextSelection =
		typeof searchTextStart === "number" &&
		typeof searchTextEnd === "number" &&
		searchTextStart >= 0 &&
		searchTextEnd >= 0;

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
	}, [bookMetadata, showIncludeSearchTextSelection]);

	const getLink = async () => {
		setLoading(true);

		const data = {
			bookId: bookMetadata?.bookId,
			...(includeCurrentPageNumber && { pageNumber }),
			...(includeSearchTextSelection && { searchTextStart, searchTextEnd }),
		};

		const encryptedData = await encrypt(JSON.stringify(data));

		const res = await sendToPb(encryptedData, expiry, deleteAfterFirstAccess);

		setLoading(false);

		if (!res) {
			setView("error");
			return;
		}

		setLinksData({
			instanceIndex: res.instanceIndex,
			deleteAfterFirstAccess,
			id: res.id,
			key: encryptedData.keyBase64Url,
			deleteToken: res.deleteToken,
		});

		setView("links");
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				if (!loading) {
					if (!newOpen && view === "error") {
						// To prevent a flash of the form while the dialog closes
						setTimeout(() => setView("form"), 250);
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
					<DialogTitle>Share </DialogTitle>

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
									Include search text selection
								</Label>
							</div>
						:	<div className="mt-4" />}

						<div className="mt-2 flex items-center gap-2">
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
								Include current page number
							</Label>

							{showIncludeSearchTextSelection && includeSearchTextSelection && (
								<Popover>
									<PopoverTrigger>
										<LucideInfo size={16} />
									</PopoverTrigger>
									<PopoverContent>
										The page number of the search text selection will be
										included.
									</PopoverContent>
								</Popover>
							)}
						</div>

						<div className="mt-4">
							<Select
								value={expiry}
								disabled={loading}
								onValueChange={(newValue) =>
									setExpiry(newValue as ExpiryDuration)
								}
							>
								<SelectTrigger className="max-w-[250px]">
									<SelectValue>
										Expires: {expiry.startsWith("1") && "after"} {expiry}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{expiryDurationTexts.map((expiryDurationText) => (
										<SelectItem
											key={expiryDurationText}
											value={expiryDurationText}
										>
											{expiryDurationText}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="mt-4 flex gap-2">
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

						<ButtonLoading className="mt-6" loading={loading} onClick={getLink}>
							Get link
						</ButtonLoading>
					</>
				)}

				{view === "links" && linkData && (
					<div className="mt-6">
						<div className="font-semibold">Access link</div>

						<div className="text-sm text-muted-foreground">
							Anyone with this link will be able to access the current book.
						</div>

						<div className="mt-4 flex items-center gap-2">
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
							link={`https://${import.meta.env.VITE_DOMAIN}/${linkData.id}${sendDecryptionKeySeparately ? "" : `#${linkData.key}`}`}
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
							className="mt-4"
							link={`https://${import.meta.env.VITE_DOMAIN}/${linkData?.id}?delete#${linkData.deleteToken}`}
							buttonLabel="Copy deletion link"
						/>
					</div>
				)}

				{view === "error" && (
					<div className="my-6 flex flex-col gap-4 text-center text-destructive">
						<div className="font-semibold">Error</div>
						<div>
							An error occurred while sending the data. Please check your
							internet connection and try again.
						</div>
					</div>
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
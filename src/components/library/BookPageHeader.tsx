import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Selection } from "@/lib/common";
import {
	SELECT_SEARCHED_TEXT_KEY,
	SHOW_LINE_NUMBERS_KEY,
} from "@/lib/local-storage-keys";
import { LucideMoreHorizontal } from "lucide-react";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { ButtonLoading } from "../common/ButtonLoading";
import { SuccessWrapper } from "../common/SuccessWrapper";
import { Button } from "../ui/button";

export const BookPageHeader = ({
	pageNumber,
	selection,
	loadingBook,
	loadingGetBookInfo,
	loadingShare,
	showCopySuccess,
	onGetBookMetadataClick,
	onShareClick,
	onCopyPageClick,
	onCopyBookClick,
	onSavePageClick,
	onSaveBookClick,
}: {
	pageNumber: number;
	selection: Selection | undefined;
	loadingBook: boolean;
	loadingGetBookInfo: boolean;
	loadingShare: boolean;
	showCopySuccess: boolean;
	onGetBookMetadataClick: () => void;
	onShareClick: () => void;
	onCopyPageClick: () => void;
	onCopyBookClick: () => void;
	onSavePageClick: () => void;
	onSaveBookClick: () => void;
}) => {
	const { width } = useWindowSize();

	const loading = loadingBook || loadingGetBookInfo || loadingShare;

	const [showLineNumbers, setShowLineNumbers] = useLocalStorage<boolean>(
		SHOW_LINE_NUMBERS_KEY,
		false,
	);

	const [selectSearchedText, setSelectSearchedText] = useLocalStorage<boolean>(
		SELECT_SEARCHED_TEXT_KEY,
		true,
	);

	return (
		<div className="mt-2 flex w-full items-end gap-1 px-1">
			<div className="mb-1 font-mono text-sm text-muted-foreground">
				<span className="hidden sm:inline">Page</span> {pageNumber}
				&thinsp;/&thinsp;410
			</div>

			<div className="flex-1" />

			<ButtonLoading
				className="mb-1"
				variant="ghost"
				size="sm"
				disabled={loading}
				loading={loadingGetBookInfo}
				onClick={onGetBookMetadataClick}
			>
				Get book info
			</ButtonLoading>

			<ButtonLoading
				className="mb-1"
				variant="ghost"
				size="sm"
				disabled={loading}
				loading={loadingShare}
				onClick={onShareClick}
			>
				Share
			</ButtonLoading>

			<DropdownMenu>
				<SuccessWrapper showSuccess={showCopySuccess}>
					<DropdownMenuTrigger asChild>
						<Button
							className="mb-1"
							variant="ghost"
							size="sm"
							disabled={loading}
						>
							<LucideMoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
				</SuccessWrapper>

				<DropdownMenuContent>
					<DropdownMenuItem className="pl-8" onClick={onCopyPageClick}>
						Copy page
					</DropdownMenuItem>

					<DropdownMenuItem className="pl-8" onClick={onCopyBookClick}>
						Copy book
					</DropdownMenuItem>

					<DropdownMenuItem className="pl-8" onClick={onSavePageClick}>
						Save page to file
					</DropdownMenuItem>

					<DropdownMenuItem className="pl-8" onClick={onSaveBookClick}>
						Save book to file
					</DropdownMenuItem>

					{(width >= 1024 || selection?.end) && <DropdownMenuSeparator />}

					{width >= 1024 && (
						<DropdownMenuCheckboxItem
							checked={showLineNumbers}
							onCheckedChange={setShowLineNumbers}
						>
							Show line numbers
						</DropdownMenuCheckboxItem>
					)}

					{selection?.end && (
						<DropdownMenuCheckboxItem
							checked={selectSearchedText}
							className="pl-8"
							onCheckedChange={setSelectSearchedText}
						>
							Select searched text
						</DropdownMenuCheckboxItem>
					)}

					{/* Not possible at the moment, see end of `Library.tsx`
					<DropdownMenuCheckboxItem checked={false}>
						Display full book
					</DropdownMenuCheckboxItem> */}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

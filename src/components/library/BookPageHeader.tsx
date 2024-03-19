import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Selection } from "@/lib/common";
import { SHOW_LINE_NUMBERS_KEY } from "@/lib/keys";
import { LucideMoreHorizontal } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
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
	onDeselectClick,
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
	onDeselectClick: () => void;
}) => {
	const loading = loadingBook || loadingGetBookInfo || loadingShare;

	const [showLineNumbers, setShowLineNumbers] = useLocalStorage<boolean>(
		SHOW_LINE_NUMBERS_KEY,
		false,
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
							<LucideMoreHorizontal size={20} />
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

					{selection && (
						<>
							<DropdownMenuSeparator />

							<DropdownMenuItem className="pl-8" onClick={onDeselectClick}>
								Deselect searched text
							</DropdownMenuItem>
						</>
					)}

					<div className="max-lg:hidden">
						<DropdownMenuSeparator />

						<DropdownMenuCheckboxItem
							checked={showLineNumbers}
							onCheckedChange={setShowLineNumbers}
						>
							Show line numbers
						</DropdownMenuCheckboxItem>
					</div>

					{/* Not possible at the moment, see end of `Library.tsx`
					<DropdownMenuCheckboxItem checked={false}>
						Display full book
					</DropdownMenuCheckboxItem> */}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

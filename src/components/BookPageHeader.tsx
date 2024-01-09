import { cn } from "@/lib/utils";
import { LucideLoader2 } from "lucide-react";
import { Page } from "./BookPage";
import { ButtonSuccess } from "./ButtonSuccess";

export const BookPageHeader = ({
	pageNumber,
	loadingContent,
	loadingBookId,
	showCopyPageSuccess,
	showCopyBookIdSuccess,
	onCopyPageClick,
	onCopyBookIdClick,
}: Pick<Page, "pageNumber"> & {
	loadingContent?: boolean;
	loadingBookId?: boolean;
	showCopyPageSuccess?: boolean;
	showCopyBookIdSuccess?: boolean;
	onCopyPageClick?: () => void;
	onCopyBookIdClick?: () => void;
}) => {
	const loading = loadingContent || loadingBookId;

	return (
		<div className="ml-3 mt-2 flex w-full items-end gap-1">
			<div className="mb-1 font-mono text-sm text-muted-foreground">
				Page {pageNumber}&thinsp;/&thinsp;410
			</div>

			<div className="flex-1" />

			<ButtonSuccess
				className="mb-1"
				variant="ghost"
				size="sm"
				disabled={loading}
				showSuccess={showCopyPageSuccess}
				onClick={onCopyPageClick}
			>
				Copy page
			</ButtonSuccess>

			<ButtonSuccess
				className="mb-1"
				variant="ghost"
				size="sm"
				disabled={loading}
				showSuccess={showCopyBookIdSuccess}
				onClick={onCopyBookIdClick}
			>
				<span className={cn(loadingBookId && "invisible")}>Copy book ID</span>

				<LucideLoader2
					className={cn(
						"absolute h-4 w-4 animate-spin",
						!loadingBookId && "invisible",
					)}
				/>
			</ButtonSuccess>
		</div>
	);
};

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
	BOOK_IMAGE_HEIGHT,
	BOOK_IMAGE_WIDTH,
	BookMetadata,
} from "@/lib/common";
import { cn, copyToClipboard, saveToFile } from "@/lib/utils";
import { LucideAlertTriangle, LucideHelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Code } from "../common/Code";
import { HighCapacityTextarea } from "../common/HighCapacityTextarea";
import { SuccessWrapper } from "../common/SuccessWrapper";

export const BookInfoDialog = ({
	bookMetadata,
	open,
	bookIdModified,
	searchTextModified,
	onOpenChange,
}: {
	bookMetadata: BookMetadata;
	bookIdModified?: boolean;
	searchTextModified?: boolean;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [showCopySuccess, setShowCopySuccess] = useState<
		"bookId" | "image" | false
	>(false);

	useEffect(() => {
		if (!open) {
			return;
		}

		requestAnimationFrame(() => {
			const canvas = canvasRef.current;
			const canvasContext = canvas?.getContext("2d");

			if (!canvas || !canvasContext) {
				return;
			}

			canvasRef.current.width = BOOK_IMAGE_WIDTH;
			canvasRef.current.height = BOOK_IMAGE_HEIGHT;

			const canvasImageData = canvasContext.createImageData(
				BOOK_IMAGE_WIDTH,
				BOOK_IMAGE_HEIGHT,
			);

			canvasImageData.data.set(bookMetadata.image);
			canvasContext.putImageData(canvasImageData, 0, 0);
		});
	}, [bookMetadata.image, open]);

	const copyOrSave = (subject: "bookId" | "image", action: "copy" | "save") =>
		new Promise<string | Blob>((resolve) =>
			subject === "bookId" ?
				resolve(bookMetadata.bookId)
			:	canvasRef.current?.toBlob((blob) => blob && resolve(blob)),
		).then((content) =>
			action === "copy" ?
				copyToClipboard(content).then(() => {
					if (!showCopySuccess) {
						setShowCopySuccess(subject);
						setTimeout(() => setShowCopySuccess(false), 2000);
					}
				})
			:	saveToFile(content, subject === "bookId" ? "Book ID" : "Image"),
		);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-full max-w-xl gap-0 overflow-auto">
				<DialogHeader>
					<DialogTitle>Book info</DialogTitle>

					{(bookIdModified || searchTextModified) && (
						<DialogDescription className="flex items-center justify-center gap-2 pt-1 font-semibold text-warning">
							<LucideAlertTriangle className="flex-shrink-0" size={20} />

							<div>
								The {bookIdModified ? "book ID" : "search text"} has been
								modified since this book was generated
							</div>
						</DialogDescription>
					)}
				</DialogHeader>

				<h3 className={cn("mt-8 font-semibold", searchTextModified && "mt-6")}>
					Location in the library
				</h3>

				<div className="mt-3 flex items-center justify-between">
					<div>Room number</div>

					<div className="text-right text-sm">
						{bookMetadata.roomIndex.length.toLocaleString()} digits
					</div>
				</div>

				<Code
					className="mt-0.5 max-h-[6rem] overflow-auto"
					display="block"
					numbersOnly
				>
					{bookMetadata.roomIndex}
				</Code>

				<div className="mt-4 flex justify-evenly">
					<div className="flex items-center gap-2">
						Wall
						<Code display="block" numbersOnly>
							{bookMetadata.wallIndexInRoom}
						</Code>
					</div>

					<div className="flex items-center gap-2">
						Shelf
						<Code display="block" numbersOnly>
							{bookMetadata.shelfIndexInWall}
						</Code>
					</div>

					<div className="flex items-center gap-2">
						Book
						<Code display="block" numbersOnly>
							{bookMetadata.bookIndexInShelf}
						</Code>
					</div>
				</div>

				<div className="mt-6 flex items-center justify-between">
					<h3 className="font-semibold">Book ID</h3>

					<div className="flex-1" />

					<SuccessWrapper showSuccess={showCopySuccess === "bookId"}>
						<Button
							className="mb-1"
							variant="ghost"
							size="sm"
							onClick={() => copyOrSave("bookId", "copy")}
						>
							Copy
						</Button>
					</SuccessWrapper>

					<Button
						className="mb-1"
						variant="ghost"
						size="sm"
						onClick={() => copyOrSave("bookId", "save")}
					>
						Save
					</Button>

					<Button
						className="mb-1 text-muted-foreground"
						variant="ghost"
						size="sm"
					>
						<LucideHelpCircle size={20} />
					</Button>
				</div>

				<HighCapacityTextarea readOnly rows={7} value={bookMetadata.bookId} />

				<div className="mt-6 flex items-center justify-between">
					<h3 className="font-semibold">Book image</h3>

					<div className="flex-1" />

					<SuccessWrapper showSuccess={showCopySuccess === "image"}>
						<Button
							className="mb-1"
							variant="ghost"
							size="sm"
							onClick={() => copyOrSave("image", "copy")}
						>
							Copy
						</Button>
					</SuccessWrapper>

					<Button
						className="mb-1"
						variant="ghost"
						size="sm"
						onClick={() => copyOrSave("image", "save")}
					>
						Save
					</Button>

					<Button
						className="mb-1 text-muted-foreground"
						variant="ghost"
						size="sm"
					>
						<LucideHelpCircle size={20} />
					</Button>
				</div>

				<canvas
					ref={canvasRef}
					className="mx-auto max-w-full overflow-auto rounded border p-1"
				/>

				<DialogFooter className="mt-6">
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

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
import { copyToClipboard, saveToFile } from "@/lib/utils";
import { encode } from "fast-png";
import { LucideAlertTriangle, LucideHelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Code } from "../common/Code";
import { HighCapacityTextarea } from "../common/HighCapacityTextarea";
import { SuccessWrapper } from "../common/SuccessWrapper";

export const BookMetadataDialog = ({
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
	const [showContent, setShowContent] = useState<boolean>(false);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [showCopySuccess, setShowCopySuccess] = useState<
		"bookId" | "image" | false
	>(false);

	useEffect(() => {
		if (!open) {
			return;
		}

		// Prevents a flash of the dialog and a Chrome warning about
		// a handler taking too long, because loading a big amount of text
		// in the textarea and the `code` tag takes a long time;
		// this can't be noticed for small books, but can be for big ones
		setTimeout(() => setShowContent(true), 10);

		// Ensures the canvas is accessible by our code
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

	/**
	 * Note: we use `fast-png`, instead of the HTML canvas, to generate the PNG data, because
	 * the canvas slightly changes the value of some pixels! This has been observed
	 * in Chrome and Firefox, both browsers changing the data in a different way;
	 * see https://codesandbox.io/p/sandbox/canvas-png-lrhrcg
	 */
	const copyOrSave = (subject: "bookId" | "image", action: "copy" | "save") =>
		new Promise<string | Blob>((resolve) => {
			if (subject === "bookId") {
				resolve(bookMetadata.bookId);
			}

			// 4 values per pixel: RGBA
			const imageData = new Uint8ClampedArray(
				BOOK_IMAGE_WIDTH * BOOK_IMAGE_HEIGHT * 4,
			);

			bookMetadata.image.forEach((value, i) => (imageData[i] = value));

			resolve(
				new Blob([
					encode({
						width: BOOK_IMAGE_WIDTH,
						height: BOOK_IMAGE_HEIGHT,
						data: imageData,
					}),
				]),
			);
		}).then((content) =>
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
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				onOpenChange(newOpen);
				if (!newOpen) {
					setShowContent(false);
				}
			}}
		>
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

				<HighCapacityTextarea
					readOnly
					rows={7}
					value={showContent ? bookMetadata.bookId : "Loading..."}
				/>

				<h3 className="mt-6 font-semibold">Location in the library</h3>

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
					{showContent ? bookMetadata.roomIndex : "Loading..."}
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

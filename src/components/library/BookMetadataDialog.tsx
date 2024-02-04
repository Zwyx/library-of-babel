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
	BookImageDimensions,
	BookMetadata,
} from "@/lib/common";
import { copyToClipboard, saveToFile } from "@/lib/utils";
import { encode } from "fast-png";
import { LucideAlertTriangle, LucideHelpCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Code } from "../common/Code";
import { HighCapacityTextarea } from "../common/HighCapacityTextarea";
import { SuccessWrapper } from "../common/SuccessWrapper";
import { Input } from "../ui/input";

export const BookMetadataDialog = ({
	bookMetadata,
	originalBookImageDimensions,
	open,
	bookIdChanged,
	bookImageChanged,
	searchTextChanged,
	onOpenChange,
}: {
	bookMetadata: BookMetadata;
	originalBookImageDimensions?: BookImageDimensions;
	bookIdChanged?: boolean;
	bookImageChanged?: boolean;
	searchTextChanged?: boolean;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const [showContent, setShowContent] = useState<boolean>(false);

	const [imageWidth, setImageWidth] = useState<number>(BOOK_IMAGE_WIDTH);
	const [imageHeight, setImageHeight] = useState<number>(BOOK_IMAGE_HEIGHT);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [showCopySuccess, setShowCopySuccess] = useState<
		"bookId" | "image" | false
	>(false);

	// 4 values per pixel: RGBA
	const dimensionsTooSmall =
		imageWidth * imageHeight * 4 < bookMetadata.bookImageData.length;

	useEffect(() => {
		if (originalBookImageDimensions) {
			setImageWidth(originalBookImageDimensions.width);
			setImageHeight(originalBookImageDimensions.height);
		}
	}, [originalBookImageDimensions]);

	const drawBookImage = useCallback(() => {
		// Ensures the canvas is accessible by our code
		requestAnimationFrame(() => {
			if (dimensionsTooSmall) {
				return;
			}

			const canvas = canvasRef.current;
			const canvasContext = canvas?.getContext("2d");

			if (!canvas || !canvasContext) {
				return;
			}

			canvasRef.current.width = imageWidth;
			canvasRef.current.height = imageHeight;

			const canvasImageData = canvasContext.createImageData(
				imageWidth,
				imageHeight,
			);

			canvasImageData.data.set(bookMetadata.bookImageData);
			canvasContext.putImageData(canvasImageData, 0, 0);
		});
	}, [dimensionsTooSmall, imageWidth, imageHeight, bookMetadata.bookImageData]);

	useEffect(() => {
		if (!open) {
			return;
		}

		// Prevents a flash of the dialog and a Chrome warning about
		// a handler taking too long, because loading a big amount of text
		// in the textarea and the `code` tag takes a long time;
		// this can't be noticed for small books, but can be for big ones
		setTimeout(() => setShowContent(true), 10);

		drawBookImage();
	}, [open, drawBookImage]);

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
			const imageData = new Uint8ClampedArray(imageWidth * imageHeight * 4);

			bookMetadata.bookImageData.forEach((value, i) => (imageData[i] = value));

			resolve(
				new Blob([
					encode({
						width: imageWidth,
						height: imageHeight,
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

					{(bookIdChanged || bookImageChanged || searchTextChanged) && (
						<DialogDescription className="flex items-center justify-center gap-2 pt-1 font-semibold text-warning">
							<LucideAlertTriangle className="flex-shrink-0" size={20} />

							<div>
								The{" "}
								{bookIdChanged ?
									"book ID"
								: bookImageChanged ?
									"book image"
								:	"search text"}{" "}
								has been modified since this book was generated.
							</div>
						</DialogDescription>
					)}
				</DialogHeader>

				<div className="mt-6 flex items-center">
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

				<div className="mt-4 flex flex-wrap justify-evenly gap-2">
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

				<div className="mb-1 mt-6 flex flex-wrap items-center gap-2">
					<h3 className="font-semibold">Book image</h3>

					<div className="flex-1" />

					<div className="flex items-center">
						<Input
							className="w-[5rem]"
							variantSize="sm"
							type="number"
							placeholder="Width"
							value={imageWidth}
							onChange={(e) => setImageWidth(parseInt(e.target.value))}
						/>

						<>&nbsp;×&nbsp;</>

						<Input
							className="w-[5rem]"
							variantSize="sm"
							type="number"
							placeholder="Height"
							value={imageHeight}
							onChange={(e) => setImageHeight(parseInt(e.target.value))}
						/>
					</div>

					<div className="flex-1" />

					<div className="flex flex-1 justify-end">
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
				</div>

				{dimensionsTooSmall ?
					<DialogDescription className="mb-1 flex items-center justify-center gap-2 pt-1 font-semibold text-warning">
						<LucideAlertTriangle className="flex-shrink-0" size={20} />
						These dimensions are too small for this book image.
					</DialogDescription>
				:	<canvas
						ref={canvasRef}
						className="mx-auto max-h-[500px] max-w-full overflow-auto rounded border p-1"
					/>
				}

				<DialogFooter className="mt-6">
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

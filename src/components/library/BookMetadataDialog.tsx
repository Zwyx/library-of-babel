import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { BookImageDimensions, BookMetadata } from "@/lib/common";
import { usePrevious } from "@/lib/usePrevious";
import { copyToClipboard, saveToFile } from "@/lib/utils";
import { encode } from "fast-png";
import { LucideHelpCircle } from "lucide-react";
import { equals } from "ramda";
import { useCallback, useEffect, useRef, useState } from "react";
import { Code } from "../common/Code";
import { HighCapacityTextarea } from "../common/HighCapacityTextarea";
import { SmallAlert } from "../common/SmallAlert";
import { SourceChangedAlert } from "../common/SourceChangedAlert";
import { SuccessWrapper } from "../common/SuccessWrapper";
import { Input } from "../ui/input";
import { AboutDialogLink } from "./about/AboutDialog";

export const BookMetadataDialog = ({
	bookMetadata,
	originalBookImageDimensions,
	open,
	bookIdChanged,
	bookImageChanged,
	searchTextChanged,
	onOpenChange,
}: {
	bookMetadata?: BookMetadata;
	originalBookImageDimensions?: BookImageDimensions;
	bookIdChanged: boolean;
	bookImageChanged: boolean;
	searchTextChanged: boolean;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const [showContent, setShowContent] = useState<boolean>(false);

	const [autoDimensions, setAutoDimensions] = useState<BookImageDimensions>({
		width: 0,
		height: 0,
	});

	const previousAutoDimensions = usePrevious(autoDimensions);

	const [imageWidth, setImageWidth] = useState<number>(1);
	const [imageHeight, setImageHeight] = useState<number>(1);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [showCopySuccess, setShowCopySuccess] = useState<
		"bookId" | "image" | false
	>(false);

	const dimensionsTooSmall =
		bookMetadata &&
		imageWidth * imageHeight * 4 < bookMetadata.bookImageData.length; // 4 values between 0 and 255 per pixel (RGBA)

	useEffect(() => {
		if (!bookMetadata) {
			return;
		}

		let length = Math.ceil(bookMetadata.bookImageData.length / 4); // 4 values between 0 and 255 per pixel (RGBA)
		let bestDivisors: number[] = [];
		let loop = true;

		while (loop) {
			const allDivisors = [...Array(length)]
				.map((_, i) => i + 1)
				.filter((i) => length % i === 0);

			const divisorsHalfLength = Math.ceil(allDivisors.length / 2) - 1;

			bestDivisors = [
				allDivisors[divisorsHalfLength],
				allDivisors[
					divisorsHalfLength + (allDivisors.length % 2 === 0 ? 1 : 0)
				],
			];

			if (bestDivisors[0] >= bestDivisors[1] / 2) {
				loop = false;
			}

			if (loop) {
				length++;
			}
		}

		setAutoDimensions({
			width: bestDivisors[1],
			height: bestDivisors[0],
		});
	}, [bookMetadata]);

	const applyAutoDimensions = useCallback(() => {
		if (originalBookImageDimensions) {
			setImageWidth(originalBookImageDimensions.width);
			setImageHeight(originalBookImageDimensions.height);
		} else {
			setImageWidth(autoDimensions.width);
			setImageHeight(autoDimensions.height);
		}
	}, [originalBookImageDimensions, autoDimensions]);

	useEffect(() => {
		if (
			originalBookImageDimensions ||
			!equals(autoDimensions, previousAutoDimensions)
		) {
			applyAutoDimensions();
		}
	}, [
		originalBookImageDimensions,
		autoDimensions,
		previousAutoDimensions,
		applyAutoDimensions,
	]);

	const drawBookImage = useCallback(() => {
		// Ensures the canvas is accessible by our code
		requestAnimationFrame(() => {
			if (!bookMetadata || dimensionsTooSmall) {
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
	}, [bookMetadata, dimensionsTooSmall, imageWidth, imageHeight]);

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
	const copyOrSave = (subject: "bookId" | "image", action: "copy" | "save") => {
		if (!bookMetadata) {
			return;
		}

		new Promise<string | Blob>((resolve) => {
			if (subject === "bookId") {
				resolve(bookMetadata.bookId);
			}

			// 4 values between 0 and 255 per pixel (RGBA)
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
	};

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
			{bookMetadata && (
				<DialogContent className="max-h-full max-w-xl gap-0 overflow-auto">
					<DialogHeader>
						<DialogTitle>Book info</DialogTitle>

						<SourceChangedAlert
							bookIdChanged={bookIdChanged}
							bookImageChanged={bookImageChanged}
							searchTextChanged={searchTextChanged}
						/>
					</DialogHeader>

					<div className="mb-1 mt-6 flex items-center">
						<h3 className="font-semibold">Book ID</h3>

						<div className="flex-1" />

						<SuccessWrapper showSuccess={showCopySuccess === "bookId"}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => copyOrSave("bookId", "copy")}
							>
								Copy
							</Button>
						</SuccessWrapper>

						<Button
							variant="ghost"
							size="sm"
							onClick={() => copyOrSave("bookId", "save")}
						>
							Save
						</Button>

						<Button variant="ghostLink" size="sm" asChild>
							<AboutDialogLink to="?about=the-book-id">
								<LucideHelpCircle size={20} />
							</AboutDialogLink>
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
						block
						breakAll
						numbersOnly
					>
						{showContent ? bookMetadata.roomIndex : "Loading..."}
					</Code>

					<div className="mt-4 flex flex-wrap justify-evenly gap-2">
						<div className="flex items-center gap-2">
							Wall
							<Code block numbersOnly>
								{bookMetadata.wallIndexInRoom}
							</Code>
						</div>

						<div className="flex items-center gap-2">
							Shelf
							<Code block numbersOnly>
								{bookMetadata.shelfIndexInWall}
							</Code>
						</div>

						<div className="flex items-center gap-2">
							Book
							<Code block numbersOnly>
								{bookMetadata.bookIndexInShelf}
							</Code>
						</div>
					</div>

					<h3 className="mt-6 font-semibold">Book image</h3>

					<div className="mb-2 mt-3 flex flex-wrap items-center gap-2">
						<div className="flex items-center">
							<Input
								className="w-[5rem] text-center"
								variantSize="sm"
								type="number"
								min={1}
								placeholder="Width"
								value={imageWidth}
								onChange={(e) => setImageWidth(parseInt(e.target.value))}
							/>

							<>&nbsp;×&nbsp;</>

							<Input
								className="w-[5rem] text-center"
								variantSize="sm"
								type="number"
								min={1}
								placeholder="Height"
								value={imageHeight}
								onChange={(e) => setImageHeight(parseInt(e.target.value))}
							/>
						</div>

						<Button
							variant="ghost"
							size="sm"
							disabled={
								imageWidth === autoDimensions.width &&
								imageHeight === autoDimensions.height
							}
							onClick={applyAutoDimensions}
						>
							Auto
						</Button>

						<div className="flex-1" />

						<div className="flex flex-1 justify-end">
							{!dimensionsTooSmall && (
								<>
									<SuccessWrapper showSuccess={showCopySuccess === "image"}>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => copyOrSave("image", "copy")}
										>
											Copy
										</Button>
									</SuccessWrapper>

									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyOrSave("image", "save")}
									>
										Save
									</Button>
								</>
							)}

							<Button variant="ghostLink" size="sm" asChild>
								<AboutDialogLink to="?about=the-book-image">
									<LucideHelpCircle size={20} />
								</AboutDialogLink>
							</Button>
						</div>
					</div>

					{dimensionsTooSmall ?
						<SmallAlert>
							These dimensions are too small for this book image.
						</SmallAlert>
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
			)}
		</Dialog>
	);
};

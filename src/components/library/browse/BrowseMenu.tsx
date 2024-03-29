import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	BookImage,
	LibraryMode,
	MAX_BOOK_IMAGE_DATA_LENGTH,
} from "@/lib/common";
import { cn, getDataFromFile, getImageFromFile } from "@/lib/utils";
import { decode } from "fast-png";
import { LucideMoreHorizontal } from "lucide-react";
import { InputHTMLAttributes, RefObject, useRef } from "react";
import { Button } from "../../ui/button";

export const BrowseMenu = ({
	mode,
	disabled,
	onBookIdLoaded,
	onBookImageLoaded,
}: {
	mode: LibraryMode;
	disabled: boolean;
	onBookIdLoaded: (bookId: string) => void;
	onBookImageLoaded: (bookImage: BookImage) => void;
}) => {
	const textInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const loadText = (file: File) =>
		file.text().then((text) => onBookIdLoaded(text.split("\n")[0]));

	const loadImage = async (file: File) => {
		try {
			const image = await getImageFromFile(file);

			const imageDataLength = image.width * image.height * 4;
			const imageDataTooLong = imageDataLength > MAX_BOOK_IMAGE_DATA_LENGTH;

			let pngImageData: ArrayBuffer;
			let width: number;
			let height: number;

			if (file.type === "image/png" && !imageDataTooLong) {
				pngImageData = await getDataFromFile(file);
				width = image.width;
				height = image.height;
			} else {
				const canvas = document.createElement("canvas");
				const canvasContext = canvas.getContext("2d");

				if (!canvasContext) {
					throw Error(
						"Error while creating HTML canvas. Your browser might not support this feature.",
					);
				}

				const ratio =
					imageDataTooLong ?
						Math.sqrt(
							// Not all the values of the last pixel (most significant, as the data is reversed) are usable,
							// so we remove 1 pixel (4 bytes) from the maximum book image data length
							imageDataLength / (MAX_BOOK_IMAGE_DATA_LENGTH - 4),
						)
					:	1;

				width = Math.floor(image.width / ratio);
				height = Math.floor(image.height / ratio);

				canvas.width = width;
				canvas.height = height;

				canvasContext.drawImage(image, 0, 0, width, height);

				pngImageData = await (await fetch(canvas.toDataURL())).arrayBuffer();
			}

			onBookImageLoaded({
				// See `copyOrSave` in `BookMetadataDialog.tsx` about why we use `fast-png`
				data: Array.from(decode(pngImageData).data),
				width,
				height,
			});
		} catch (err) {
			alert(err);
		}
	};

	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className={cn(mode !== "browse" && "invisible")}
						variant="outline"
						size="sm"
						disabled={disabled}
					>
						<LucideMoreHorizontal size={20} />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={() => textInputRef.current?.click()}>
						Load a book ID from a file
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
						Open an image
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<FileInput
				forwardedRef={textInputRef}
				accept="text/plain"
				onFile={loadText}
			/>

			<FileInput
				forwardedRef={imageInputRef}
				accept="image/*"
				onFile={loadImage}
			/>
		</div>
	);
};

/**
 * The file input needs to be outside the menu content, to stay in the DOM after
 * the corresponding menu item is clicked, otherwise `onChange` is not triggered when selecting a file;
 * we also can't simply set `display: none` on it, because that apparently makes Safari to disable it
 */
const FileInput = ({
	forwardedRef,
	accept,
	onFile,
}: {
	forwardedRef: RefObject<HTMLInputElement>;
	accept: InputHTMLAttributes<HTMLInputElement>["accept"];
	onFile: (file: File) => void;
}) => {
	return (
		<input
			ref={forwardedRef}
			className="pointer-events-none w-0 opacity-0"
			tabIndex={-1}
			type="file"
			accept={accept}
			onChange={(e) => {
				const file = e.target.files?.item(0);

				if (file) {
					if (forwardedRef.current) {
						// clear the file to allow `onChange` to be triggered if the same file is chosen again
						forwardedRef.current.value = "";
					}

					onFile(file);
				}
			}}
		/>
	);
};

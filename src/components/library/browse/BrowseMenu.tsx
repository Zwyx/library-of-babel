import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LibraryMode } from "@/lib/common";
import { cn } from "@/lib/utils";
import { decode } from "fast-png";
import { LucideMoreHorizontal } from "lucide-react";
import { InputHTMLAttributes, RefObject, useRef } from "react";
import { Button } from "../../ui/button";

export const BrowseMenu = ({
	mode,
	disabled,
	onBookIdLoaded,
	onImageLoaded,
}: {
	mode: LibraryMode;
	disabled: boolean;
	onBookIdLoaded: (bookId: string) => void;
	onImageLoaded: (image: number[]) => void;
}) => {
	const textInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

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
				onFile={(file) =>
					file.text().then((text) => onBookIdLoaded(text.split("\n")[0]))
				}
			/>

			<FileInput
				forwardedRef={imageInputRef}
				accept="image/png"
				onFile={(file) => {
					requestAnimationFrame(() => {
						const fileReader = new FileReader();

						fileReader.readAsArrayBuffer(file);

						fileReader.onload = (e) => {
							const data = e.target?.result as ArrayBuffer;

							// See `copyOrSave` in `BookMetadataDialog.tsx` about why we use `fast-png`
							onImageLoaded(Array.from(decode(data).data));
						};
					});
				}}
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

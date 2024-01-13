import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BookIdData } from "@/lib/common";
import { useState } from "react";
import { Code } from "./Code";

export const BookIdDialog = ({
	bookIdData,
	open,
	onOpenChange,
}: {
	bookIdData: BookIdData;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const [showCopyBookIdSuccess, setShowCopyBookIdSuccess] =
		useState<boolean>(false);

	// void navigator.clipboard.writeText(data.result).then(() => {
	// 	if (!showCopyBookIdSuccess) {
	// 		setTimeout(() => {
	// 			setShowCopyBookIdSuccess(true);
	// 			setTimeout(() => setShowCopyBookIdSuccess(false), 2000);
	// 		}, 200);
	// 	}
	// });

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{/* <DialogTrigger asChild>
				<Button variant="ghost" title="Search settings" disabled={loading}>
					<LucideSettings className="h-5 w-5" />
				</Button>
			</DialogTrigger> */}

			<DialogContent className="max-h-full gap-0 overflow-auto">
				<DialogHeader>
					<DialogTitle>Book ID</DialogTitle>
					{/* <DialogDescription>Blah</DialogDescription> */}
				</DialogHeader>

				<Textarea
					className="mt-4 resize-none break-all font-mono"
					readOnly
					rows={10}
					placeholder="Book ID"
					spellCheck={false} // for performance
					autoComplete="off" // for performance
					value={bookIdData.bookId}
					// eslint-disable-next-line jsx-a11y/no-autofocus
					// autoFocus
					// onChange={(e) =>
					// 	mode === "search"
					// 		? setSearchText(e.target.value)
					// 		: setBookId(e.target.value)
					// }
					// onKeyDown={(e) => {
					// 	if (e.key === "Enter") {
					// 		e.preventDefault();
					// 		getContent();
					// 	}
					// }}
				/>

				<h3 className="mt-6 font-semibold">Location in the library</h3>

				<div className="mt-2 flex items-center justify-between">
					<div>Room</div>

					<div className="text-right text-sm">
						{bookIdData.roomIndex.length.toLocaleString()} digits
					</div>
				</div>

				<Code
					className="max-h-[6rem] overflow-auto"
					display="block"
					numbersOnly
				>
					{
						//bookIdData.roomIndex.length > roomDigits							? `${bookIdData.roomIndex.slice(0, roomDigits)}…`							:
						bookIdData.roomIndex
					}
				</Code>

				<div className="mt-5 flex justify-evenly">
					<div className="flex items-center gap-2">
						Wall
						<Code display="block" numbersOnly>
							{bookIdData.wallIndexInRoom}
						</Code>
					</div>

					<div className="flex items-center gap-2">
						Shelf
						<Code display="block" numbersOnly>
							{bookIdData.shelfIndexInWall}
						</Code>
					</div>

					<div className="flex items-center gap-2">
						Book
						<Code display="block" numbersOnly>
							{bookIdData.bookIndexInShelf}
						</Code>
					</div>
				</div>

				<DialogFooter className="mt-6">
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

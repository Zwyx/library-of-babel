import { Book, BookPage } from "@/components/BookPage";
import { Pagination } from "@/components/Pagination";
import { Privacy } from "@/components/Privacy";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useWorkerContext } from "@/lib/WorkerContext.const";
import { SEARCH_OPTIONS_KEY } from "@/lib/keys";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/worker";
import { LucideLoader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

const INVALID_TEXT_REGEX = /[^ abcdefghijklmnopqrstuvwxyz,.]/g;

export const Browse = ({ mode }: { mode: "browse" | "search" }) => {
	const { worker } = useWorkerContext();

	const [text, setText] = useState<string>("");
	const [invalidTextDialogOpen, setInvalidTextDialogOpen] =
		useState<boolean>(false);
	const [searchOptions, setSearchOptions] = useLocalStorage<
		"firstBook" | "pageWithRandom" | "bookWithRandom"
	>(SEARCH_OPTIONS_KEY, "firstBook");
	const [loadingReal, setLoadingReal] = useState<boolean>(false);
	const [loadingMin, setLoadingMin] = useState<boolean>(false);
	const [book, setBook] = useState<Book>();
	const [pageNumber, setPageNumber] = useState<number>(1);

	const loading = loadingReal || loadingMin;

	const getContent = () => {
		const data = text
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(INVALID_TEXT_REGEX, "");

		if (!data.length) {
			setInvalidTextDialogOpen(true);
			return;
		}

		setLoadingReal(true);
		setLoadingMin(true);

		const message: Message = {
			operation: mode === "search" ? "findBook" : "getBookFromId",
			data,
			options: {
				find: searchOptions,
			},
		};

		worker.postMessage(message);

		setTimeout(() => setLoadingMin(false), 200);
	};

	const onWorkerMessage = ({ data }: MessageEvent<Book>) => {
		setLoadingReal(false);
		setBook(data);
	};

	useEffect(() => {
		worker.addEventListener("message", onWorkerMessage);

		return () => {
			worker.removeEventListener("message", onWorkerMessage);
		};
	}, [worker]);

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="flex w-full flex-col gap-1">
				<Textarea
					className="w-full resize-none"
					value={text}
					placeholder={mode === "search" ? "Search text" : "Book ID"}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							getContent();
						}
					}}
				/>
				<Privacy />
			</div>

			{mode === "search" && (
				<>
					<RadioGroup
						value={searchOptions}
						onValueChange={(newValue) =>
							setSearchOptions(newValue as typeof searchOptions)
						}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="firstBook" id="firstBook" />
							<Label htmlFor="firstBook">
								Find the first book containing the search text
							</Label>
						</div>

						<div className="flex items-center space-x-2">
							<RadioGroupItem value="pageWithRandom" id="pageWithRandom" />
							<Label htmlFor="pageWithRandom">
								Find a page containing the search text
							</Label>
						</div>

						<div className="flex items-center space-x-2">
							<RadioGroupItem value="bookWithRandom" id="bookWithRandom" />
							<Label htmlFor="bookWithRandom">
								Find a book containing the search text
							</Label>
						</div>
					</RadioGroup>
				</>
			)}

			<Button className="my-4" disabled={!text || loading} onClick={getContent}>
				<span className={cn(loading && "invisible")}>
					{mode === "search" ? "Find a book" : "Retrieve the book"}
				</span>

				<LucideLoader2
					className={cn(
						"absolute h-4 w-4 animate-spin",
						!loading && "invisible",
					)}
				/>
			</Button>

			<Dialog
				open={invalidTextDialogOpen}
				onOpenChange={setInvalidTextDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invalid text</DialogTitle>
					</DialogHeader>

					<div>
						The search text contains only invalid characters, please enter valid
						ones.
					</div>

					<div>
						Valid characters are the space, the letters{" "}
						<code>abcdefghijklmnopqrstuvwxyz</code>, the comma, and the period.
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="secondary">Close</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{!book ? (
				// this is to set the width of the text area
				<BookPage
					className="invisible"
					pageNumber={0}
					lines={[
						{
							chars:
								"················································································",
						},
					]}
				/>
			) : (
				<>
					<Pagination
						min={1}
						max={410}
						current={pageNumber}
						onChange={setPageNumber}
					/>

					<BookPage
						lines={book.pages[pageNumber - 1].lines}
						pageNumber={pageNumber}
						searchTextStart={book.searchTextStart}
						searchTextEnd={book.searchTextEnd}
					/>
				</>
			)}

			{/* {book.map(({ key, pageNumber, lines }) => (
				<Page key={key} pageNumber={pageNumber} lines={lines} />
			))} */}
		</div>
	);
};

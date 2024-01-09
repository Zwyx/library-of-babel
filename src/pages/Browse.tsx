import { Book, BookPage } from "@/components/BookPage";
import { BookPageHeader } from "@/components/BookPageHeader";
import { InlineCode } from "@/components/InlineCode";
import { Pagination } from "@/components/Pagination";
import { Privacy } from "@/components/Privacy";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useWorkerContext } from "@/lib/WorkerContext.const";
import { SEARCH_OPTIONS_KEY } from "@/lib/keys";
import { cn } from "@/lib/utils";
import {
	BASE_29_BOOK_ALPHABET,
	BASE_81_ALPHABET,
	LINE_LENGTH,
	Message,
	PAGE_LENGTH,
} from "@/lib/worker";
import { LucideLoader2, LucideSettings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export const Browse = ({ mode }: { mode: "browse" | "search" | "random" }) => {
	const { worker } = useWorkerContext();

	const [bookId, setBookId] = useState<string>("");
	const [searchText, setSearchText] = useState<string>("");

	const [invalidTextDialogOpen, setInvalidTextDialogOpen] =
		useState<boolean>(false);

	const [searchOptions, setSearchOptions] = useLocalStorage<
		"firstBook" | "pageWithRandom" | "bookWithRandom"
	>(SEARCH_OPTIONS_KEY, "bookWithRandom");

	const [randomOptions, setRandomOptions] = useLocalStorage<
		"pageWithRandom" | "bookWithRandom"
	>(SEARCH_OPTIONS_KEY, "bookWithRandom");

	const [loadingContentReal, setLoadingReal] = useState<boolean>(false);
	const [loadingContentMin, setLoadingMin] = useState<boolean>(false);
	const [loadingBookIdReal, setLoadingBookIdReal] = useState<boolean>(false);
	const [loadingBookIdMin, setLoadingBookIdMin] = useState<boolean>(false);

	const [book, setBook] = useState<Book | undefined>();
	const [pageNumber, setPageNumber] = useState<number>(1);

	const loadingContent = loadingContentReal || loadingContentMin;
	const loadingBookId = loadingBookIdReal || loadingBookIdMin;
	const loading = loadingContent || loadingBookId;

	const [showCopyPageSuccess, setShowCopyPageSuccess] =
		useState<boolean>(false);

	const [showCopyBookIdSuccess, setShowCopyBookIdSuccess] =
		useState<boolean>(false);

	const getContent = () => {
		const data =
			mode === "search"
				? searchText
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, "")
						.toLowerCase()
						.replace(new RegExp(`[^${BASE_29_BOOK_ALPHABET}]`, "g"), "")
				: mode === "random"
				? ""
				: bookId.replace(new RegExp(`[^${BASE_81_ALPHABET}]`, "g"), "");

		if (!data.length && mode !== "random") {
			setInvalidTextDialogOpen(true);
			return;
		}

		setLoadingReal(true);
		setLoadingMin(true);

		const message: Message = {
			operation:
				mode === "search" || mode === "random" ? "findBook" : "getBookFromId",
			data,
			options: {
				find: mode === "search" ? searchOptions : randomOptions,
			},
		};

		worker.postMessage(message);

		setTimeout(() => setLoadingMin(false), 200);
	};

	const getId = () => {
		setLoadingBookIdReal(true);
		setLoadingBookIdMin(true);

		const message: Message = {
			operation: "getId",
			data: book?.pages ?? [],
		};

		worker.postMessage(message);

		setTimeout(() => setLoadingBookIdMin(false), 200);
	};

	const onWorkerMessage = useCallback(
		({
			data,
		}: MessageEvent<
			| { operation: "getBookFromId" | "findBook"; result: Book }
			| { operation: "getId"; result: string }
		>) => {
			if (data.operation === "getBookFromId" || data.operation === "findBook") {
				setLoadingReal(false);
				setBook(data.result);

				if (typeof data.result.searchTextStart === "number") {
					setPageNumber(
						Math.floor(data.result.searchTextStart / PAGE_LENGTH) + 1,
					);
				}

				return;
			}

			// this test is only to please TypeScript
			if (data.operation === "getId") {
				setLoadingBookIdReal(false);
				navigator.clipboard
					.writeText(data.result)
					.then(() => {
						if (!showCopyBookIdSuccess) {
							setTimeout(() => {
								setShowCopyBookIdSuccess(true);
								setTimeout(() => setShowCopyBookIdSuccess(false), 2000);
							}, 200);
						}
					})
					.catch(alert);
			}
		},
		[showCopyBookIdSuccess],
	);

	useEffect(() => {
		worker.addEventListener("message", onWorkerMessage);

		return () => {
			worker.removeEventListener("message", onWorkerMessage);
		};
	}, [worker, onWorkerMessage]);

	const copyPageToClipboard = () => {
		if (book) {
			void navigator.clipboard
				.writeText(
					book.pages[pageNumber - 1].lines.map(({ chars }) => chars).join("\n"),
				)
				.then(() => {
					if (!showCopyPageSuccess) {
						setShowCopyPageSuccess(true);
						setTimeout(() => setShowCopyPageSuccess(false), 2000);
					}
				});
		}
	};

	return (
		<div className="flex flex-col items-center gap-2">
			{(mode === "browse" || mode === "search") && (
				<div className="flex w-full flex-col gap-1">
					<Textarea
						className="w-full resize-none"
						value={mode === "search" ? searchText : bookId}
						placeholder={
							mode === "search" ? "Enter search text" : "Enter book ID"
						}
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						onChange={(e) =>
							mode === "search"
								? setSearchText(e.target.value)
								: setBookId(e.target.value)
						}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								getContent();
							}
						}}
					/>
					<Privacy />
				</div>
			)}

			<div className="flex w-full flex-wrap items-center justify-between">
				<Button variant="ghost" title="Search settings" className="invisible">
					<div className="h-5 w-5 " />
				</Button>

				<Button
					className="my-4"
					disabled={
						(mode === "browse" && !bookId) ||
						(mode === "search" && !searchText) ||
						loading
					}
					onClick={getContent}
				>
					<span className={cn(loadingContent && "invisible")}>
						{mode === "search"
							? "Find a book"
							: mode === "random"
							? "Pick a random book"
							: "Retrieve the book"}
					</span>

					<LucideLoader2
						className={cn(
							"absolute h-4 w-4 animate-spin",
							!loadingContent && "invisible",
						)}
					/>
				</Button>

				{(mode === "search" || mode === "random") && (
					<Dialog
						onOpenChange={(open) => {
							if (!open && (mode !== "search" || searchText)) {
								getContent();
							}
						}}
					>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								title="Search settings"
								disabled={loading}
							>
								<LucideSettings className="h-5 w-5" />
							</Button>
						</DialogTrigger>

						<DialogContent className="max-h-full overflow-auto">
							<DialogHeader>
								<DialogTitle>
									{mode === "search" ? "Search settings" : "Settings"}
								</DialogTitle>
								<DialogDescription>
									Select how to find the text you search.
								</DialogDescription>
							</DialogHeader>

							<RadioGroup
								value={mode === "search" ? searchOptions : randomOptions}
								onValueChange={(newValue) =>
									mode === "search"
										? setSearchOptions(newValue as typeof searchOptions)
										: setRandomOptions(newValue as typeof randomOptions)
								}
							>
								{mode === "search" && (
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="firstBook" id="firstBook" />
										<Label htmlFor="firstBook">
											Find the first book containing the search text
										</Label>
									</div>
								)}

								<div className="flex items-center space-x-2">
									<RadioGroupItem value="pageWithRandom" id="pageWithRandom" />
									<Label htmlFor="pageWithRandom">
										{mode === "search"
											? "Find a page containing the search text"
											: "First page"}
									</Label>
								</div>

								<div className="flex items-center space-x-2">
									<RadioGroupItem value="bookWithRandom" id="bookWithRandom" />
									<Label htmlFor="bookWithRandom">
										{mode === "search"
											? "Find a book containing the search text"
											: "Full book, and open a random page"}
									</Label>
								</div>
							</RadioGroup>

							<DialogFooter>
								<DialogClose asChild>
									<Button variant="secondary">Close</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</div>

			<Dialog
				open={invalidTextDialogOpen}
				onOpenChange={setInvalidTextDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{mode === "search" ? "Invalid text" : "Invalid ID"}
						</DialogTitle>
					</DialogHeader>

					{mode === "browse" && (
						<>
							<div>
								The book ID contains only invalid characters, please enter a
								valid book ID.
							</div>

							<div>Valid characters are:</div>

							<InlineCode>{BASE_81_ALPHABET}</InlineCode>
						</>
					)}

					{mode === "search" && (
						<>
							<div>
								The search text contains only invalid characters, please enter
								valid ones.
							</div>

							<div>
								Valid characters are the space, the letters{" "}
								<InlineCode>abcdefghijklmnopqrstuvwxyz</InlineCode>, the comma,
								and the period.
							</div>
						</>
					)}

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
							chars: BASE_29_BOOK_ALPHABET[0].repeat(LINE_LENGTH),
						},
					]}
				/>
			) : (
				<div className="flex flex-col items-center">
					<Pagination
						min={1}
						max={410}
						current={pageNumber}
						loading={loadingContent}
						onChange={setPageNumber}
					/>

					<BookPageHeader
						pageNumber={pageNumber}
						loadingContent={loadingContent}
						loadingBookId={loadingBookId}
						showCopyPageSuccess={showCopyPageSuccess}
						showCopyBookIdSuccess={showCopyBookIdSuccess}
						onCopyPageClick={copyPageToClipboard}
						onCopyBookIdClick={getId}
					/>

					<BookPage
						lines={book.pages[pageNumber - 1].lines}
						pageNumber={pageNumber}
						searchTextStart={book.searchTextStart}
						searchTextEnd={book.searchTextEnd}
					/>
				</div>
			)}
		</div>
	);
};

import { ButtonLoading } from "@/components/common/ButtonLoading";
import { HighCapacityTextarea } from "@/components/common/HighCapacityTextarea";
import { SmallAlert } from "@/components/common/SmallAlert";
import { BookMetadataDialog } from "@/components/library/BookMetadataDialog";
import { BookPage } from "@/components/library/BookPage";
import { BookPageHeader } from "@/components/library/BookPageHeader";
import { ComputationErrorDialog } from "@/components/library/ComputationErrorDialog";
import { InvalidDataDialog } from "@/components/library/InvalidDataDialog";
import { OptionsDialog } from "@/components/library/OptionsDialog";
import { Pagination } from "@/components/library/Pagination";
import { Privacy } from "@/components/library/Privacy";
import { BrowseMenu } from "@/components/library/browse/BrowseMenu";
import { useWorkerContext } from "@/lib/WorkerContext.const";
import {
	BASE_29_ALPHABET,
	Book,
	BookImage,
	BookImageDimensions,
	BookMetadata,
	CHARS_PER_LINE,
	CHARS_PER_PAGE,
	LibraryMode,
	MessageFromWorker,
	MessageToWorker,
	PAGES_PER_BOOK,
	RandomOptions,
	SearchOptions,
} from "@/lib/common";
import { RANDOM_OPTIONS_KEY, SEARCH_OPTIONS_KEY } from "@/lib/keys";
import { copyToClipboard, saveToFile } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export const Library = ({ mode }: { mode: LibraryMode }) => {
	const { worker } = useWorkerContext();

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [bookId, setBookId] = useState<string>("");
	const [bookImageDimensions, setBookImageDimensions] =
		useState<BookImageDimensions>();
	const [searchText, setSearchText] = useState<string>("");

	const bookIdChanged = useRef<boolean>(false);
	const bookImageChanged = useRef<boolean>(false);
	const searchTextChanged = useRef<boolean>(false);

	const [invalidDataDialogOpen, setInvalidDataDialogOpen] =
		useState<boolean>(false);

	const [searchOptions, setSearchOptions] = useLocalStorage<SearchOptions>(
		SEARCH_OPTIONS_KEY,
		{ numberOfPages: 10 },
	);

	const [randomOptions, setRandomOptions] = useLocalStorage<RandomOptions>(
		RANDOM_OPTIONS_KEY,
		{ numberOfPages: 10 },
	);

	const [loadingBookReal, setLoadingBookReal] = useState<boolean>(false);
	const [loadingBookMin, setLoadingBookMin] = useState<boolean>(false);
	const [loadingBookMetadataReal, setLoadingBookMetadataReal] =
		useState<boolean>(false);
	const [loadingBookMetadataMin, setLoadingBookMetadataMin] =
		useState<boolean>(false);

	const [book, setBook] = useState<Book | undefined>();
	const [dataTruncated, setDataTruncated] = useState<boolean>();
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [bookMetadata, setBookMetadata] = useState<BookMetadata | undefined>();

	const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);

	const [bookMetadataDialogOpen, setBookMetadataDialogOpen] =
		useState<boolean>(false);

	const [computationError, setComputationError] = useState<string>();
	const [computationErrorDialogOpen, setComputationErrorDialogOpen] =
		useState<boolean>(false);

	const loadingBook = loadingBookReal || loadingBookMin;
	const loadingBookMetadata = loadingBookMetadataReal || loadingBookMetadataMin;
	const loading = loadingBook || loadingBookMetadata;

	const canRun =
		((mode === "browse" && !!bookId.trim()) ||
			(mode === "search" && !!searchText) ||
			mode === "random") &&
		!loading;

	const onBookIdChange = (newBookId: string) => {
		setBookId(newBookId);
		bookIdChanged.current = true;
	};

	const onBookImageChange = () => {
		bookImageChanged.current = true;
	};

	const onSearchTextChange = (newSearchText: string) => {
		setSearchText(newSearchText);
		searchTextChanged.current = true;
	};

	const getBook = (param?: { bookId?: string; bookImage?: BookImage }) => {
		setLoadingBookReal(true);
		setLoadingBookMin(true);

		setBookImageDimensions(
			param?.bookImage?.data ?
				{
					width: param.bookImage.width,
					height: param.bookImage.height,
				}
			:	undefined,
		);

		const operation = mode;

		const message: MessageToWorker =
			operation === "browse" && param?.bookImage?.data ?
				{
					operation,
					source: "bookImage",
					bookImageData: param.bookImage.data,
				}
			: operation === "browse" ?
				{
					operation,
					source: "bookId",
					bookId: param?.bookId || bookId,
				}
			: operation === "search" ?
				{
					operation,
					searchText,
					searchOptions,
				}
			:	{
					operation,
					randomOptions,
				};

		worker.postMessage(message);

		setTimeout(() => setLoadingBookMin(false), 200);
	};

	const getBookMetadata = () => {
		if (!book) {
			return;
		}

		setLoadingBookMetadataReal(true);
		setLoadingBookMetadataMin(true);

		const message: MessageToWorker = {
			operation: "getBookMetadata",
			book,
		};

		worker.postMessage(message);

		setTimeout(() => setLoadingBookMetadataMin(false), 200);
	};

	const onWorkerMessage = useCallback(
		({ data }: MessageEvent<MessageFromWorker>) => {
			setLoadingBookReal(false);
			setLoadingBookMetadataReal(false);

			if (data.error) {
				setComputationError(String(data.error));
				setComputationErrorDialogOpen(true);
				return;
			}

			const operation = data.operation;

			switch (operation) {
				case "browse":
				case "search":
				case "random": {
					if (data.invalidData) {
						setInvalidDataDialogOpen(true);
						return;
					}

					setBook(data.book);

					if (data.bookId) {
						setBookId(data.bookId);
					}

					setDataTruncated(data.dataTruncated);

					setBookMetadata(undefined);

					bookIdChanged.current = false;
					bookImageChanged.current = false;
					searchTextChanged.current = false;

					if (operation === "browse") {
						setPageNumber(1);
					} else if (typeof data.book?.searchTextStart === "number") {
						setPageNumber(
							Math.floor(data.book.searchTextStart / CHARS_PER_PAGE) + 1,
						);
					}

					break;
				}

				case "getBookMetadata": {
					setBookMetadata(data.bookMetadata);
					setBookMetadataDialogOpen(true);

					break;
				}
			}
		},
		[],
	);

	useEffect(() => {
		worker.addEventListener("message", onWorkerMessage);

		return () => {
			worker.removeEventListener("message", onWorkerMessage);
		};
	}, [worker, onWorkerMessage]);

	const copyOrSave = (subject: "page" | "book", action: "copy" | "save") => {
		if (!book) {
			return;
		}

		const content =
			subject === "page" ?
				book.pages[pageNumber - 1].lines.map(({ chars }) => chars).join("\n")
			:	book.pages
					.map(
						({ lines }, i) =>
							`Page ${i + 1} / ${PAGES_PER_BOOK}\n${lines.map(({ chars }) => chars).join("\n")}`,
					)
					.join("\n\n");

		if (action === "copy") {
			copyToClipboard(content).then(() => {
				if (!showCopySuccess) {
					setShowCopySuccess(true);
					setTimeout(() => setShowCopySuccess(false), 2000);
				}
			});
		} else {
			saveToFile(content, subject === "page" ? "Page" : "Book");
		}
	};

	return (
		<div className="flex flex-col items-center gap-1">
			<Privacy />

			{(mode === "browse" || mode === "search") && (
				<HighCapacityTextarea
					forwardedRef={textareaRef}
					value={mode === "search" ? searchText : bookId}
					placeholder={
						mode === "browse" ? "Enter a book ID" : "Enter search text"
					}
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					onChange={(e) =>
						mode === "browse" ?
							onBookIdChange(e.target.value)
						:	onSearchTextChange(e.target.value)
					}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							getBook();
						}
					}}
				/>
			)}

			<div className="mb-2 mt-4 flex w-full flex-wrap items-center justify-between">
				<BrowseMenu
					mode={mode}
					disabled={loading}
					onBookIdLoaded={(newBookId) => {
						onBookIdChange(newBookId);
						getBook({ bookId: newBookId });
					}}
					onBookImageLoaded={(bookImage) => {
						onBookImageChange();
						getBook({ bookImage });
					}}
				/>

				<ButtonLoading
					disabled={!canRun}
					loading={loadingBook}
					onClick={() => getBook()}
				>
					{mode === "browse" ?
						"Retrieve the book"
					: mode === "search" ?
						"Find a book"
					:	"Pick a random book"}
				</ButtonLoading>

				<OptionsDialog
					mode={mode}
					searchOptions={searchOptions}
					randomOptions={randomOptions}
					disabled={loading}
					onSearchOptionsChange={setSearchOptions}
					onRandomOptionsChange={setRandomOptions}
					onRerun={() => canRun && getBook()}
				/>
			</div>

			<InvalidDataDialog
				mode={mode}
				open={invalidDataDialogOpen}
				onOpenChange={(newOpen) => {
					setInvalidDataDialogOpen(newOpen);
					if (!newOpen) {
						// Ensures the textarea is accessible by our code
						requestAnimationFrame(() => textareaRef.current?.focus());
					}
				}}
			/>

			{dataTruncated && (
				<SmallAlert>
					The {mode === "browse" ? "data" : "search text"} was too large and has
					been truncated.{" "}
					{/* <AboutDialogLink to="?about#tbd">Learn more</AboutDialogLink> */}
				</SmallAlert>
			)}

			{!book ?
				// this is to set the width of the text area
				<BookPage
					className="invisible"
					pageNumber={0}
					lines={[
						{
							chars: BASE_29_ALPHABET[0].repeat(CHARS_PER_LINE),
						},
					]}
				/>
			:	<div className="mt-4 flex flex-col items-center">
					<Pagination
						min={1}
						max={PAGES_PER_BOOK}
						pageNumber={pageNumber}
						disabled={loadingBook}
						onChange={setPageNumber}
					/>

					<BookPageHeader
						pageNumber={pageNumber}
						loadingBook={loadingBook}
						loadingBookMetadata={loadingBookMetadata}
						onGetBookMetadataClick={() =>
							bookMetadata ? setBookMetadataDialogOpen(true) : getBookMetadata()
						}
						showCopySuccess={showCopySuccess}
						onCopyPageClick={() => copyOrSave("page", "copy")}
						onCopyBookClick={() => copyOrSave("book", "copy")}
						onSavePageClick={() => copyOrSave("page", "save")}
						onSaveBookClick={() => copyOrSave("book", "save")}
					/>

					<BookMetadataDialog
						bookMetadata={bookMetadata}
						originalBookImageDimensions={bookImageDimensions}
						bookIdChanged={mode === "browse" && bookIdChanged.current}
						bookImageChanged={mode === "browse" && bookImageChanged.current}
						searchTextChanged={mode === "search" && searchTextChanged.current}
						open={bookMetadataDialogOpen}
						onOpenChange={setBookMetadataDialogOpen}
					/>

					<BookPage
						lines={book.pages[pageNumber - 1].lines}
						pageNumber={pageNumber}
						searchTextStart={book.searchTextStart}
						searchTextEnd={book.searchTextEnd}
					/>
				</div>
			}

			<ComputationErrorDialog
				error={computationError}
				open={computationErrorDialogOpen}
				onOpenChange={setComputationErrorDialogOpen}
			/>

			{/* Displaying the full book isn't possible at the moment for performance issues,
			    because each space character is a `span` with a CSS gradient, and having
			    more than a million of them make the page very laggy, and can ever crash.
			{book?.pages.map(({ key, pageNumber, lines }) => (
				<BookPage key={key} pageNumber={pageNumber} lines={lines} />
			))} */}
		</div>
	);
};

import { ButtonLoading } from "@/components/common/ButtonLoading";
import { HighCapacityTextarea } from "@/components/common/HighCapacityTextarea";
import { SmallAlert } from "@/components/common/SmallAlert";
import { BookMetadataDialog } from "@/components/library/BookMetadataDialog";
import { BookPage } from "@/components/library/BookPage";
import { BookPageHeader } from "@/components/library/BookPageHeader";
import {
	ComputationErrorDialog,
	ComputationErrorSource,
} from "@/components/library/ComputationErrorDialog";
import { DeleteDialog } from "@/components/library/DeleteDialog";
import { InvalidDataDialog } from "@/components/library/InvalidDataDialog";
import { OptionsDialog } from "@/components/library/OptionsDialog";
import { Pagination } from "@/components/library/Pagination";
import { Privacy } from "@/components/library/Privacy";
import { RetrieveDialog } from "@/components/library/RetrieveDialog";
import { ShareDialog } from "@/components/library/ShareDialog";
import { AboutDialogLink } from "@/components/library/about/AboutDialog";
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
	ShareData,
} from "@/lib/common";
import {
	RANDOM_OPTIONS_KEY,
	SEARCH_OPTIONS_KEY,
} from "@/lib/local-storage-keys";
import { useHistoryState } from "@/lib/useHistoryState";
import { copyToClipboard, saveToFile } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";

type BookMetadataPurpose = "book-info" | "share";

export const Library = ({ mode }: { mode: LibraryMode }) => {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const deletion = searchParams.get("delete") === "";
	const { hash } = useLocation();

	const { worker } = useWorkerContext();

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [bookId, setBookId] = useState<string>("");
	const [bookImageDimensions, setBookImageDimensions] =
		useState<BookImageDimensions>();
	const [searchText, setSearchText] = useState<string>("");

	const bookIdChanged = useRef<boolean>(false);
	const bookImageChanged = useRef<boolean>(false);
	const searchTextChanged = useRef<boolean>(false);

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

	const [computationError, setComputationError] = useState<string>();
	const [computationErrorSource, setComputationErrorSource] =
		useState<ComputationErrorSource>("local");

	const { state, pushState, pushStateOrNavigateBack } = useHistoryState<{
		invalidDataDialogOpen?: boolean;
		bookMetadataDialogOpen?: boolean;
		shareDialogOpen?: boolean;
		computationErrorDialogOpen?: boolean;
	}>();

	const partialShareData =
		useRef<Pick<ShareData, "pageNumber" | "selection">>();
	const bookMetadataPurpose = useRef<BookMetadataPurpose>("book-info");

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

	const getBookMetadata = (purpose: BookMetadataPurpose) => {
		if (!book) {
			return;
		}

		bookMetadataPurpose.current = purpose;

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
				setComputationErrorSource(
					partialShareData.current ? "shared" : "local",
				);
				pushState({ computationErrorDialogOpen: true });

				partialShareData.current = undefined;

				return;
			}

			const operation = data.operation;

			switch (operation) {
				case "browse":
				case "search":
				case "random": {
					if (data.invalidData) {
						pushState({ invalidDataDialogOpen: true });
						return;
					}

					const newBook: Book | undefined =
						data.book ?
							{
								...data.book,
								selection:
									partialShareData.current?.selection || data.book.selection,
							}
						:	undefined;

					setBook(newBook);

					if (data.bookId) {
						setBookId(data.bookId);
					}

					setDataTruncated(data.dataTruncated);

					setBookMetadata(undefined);

					bookIdChanged.current = false;
					bookImageChanged.current = false;
					searchTextChanged.current = false;

					if (newBook?.selection) {
						setPageNumber(
							Math.floor(newBook.selection.start / CHARS_PER_PAGE) + 1,
						);
					} else if (operation === "browse") {
						setPageNumber(
							typeof partialShareData.current?.pageNumber === "number" ?
								partialShareData.current?.pageNumber
							:	1,
						);
					}

					partialShareData.current = undefined;

					break;
				}

				case "getBookMetadata": {
					setBookMetadata(data.bookMetadata);

					if (bookMetadataPurpose.current === "book-info") {
						pushState({ bookMetadataDialogOpen: true });
					} else if (bookMetadataPurpose.current === "share") {
						pushState({ shareDialogOpen: true });
					}

					break;
				}
			}
		},
		[pushState],
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
			{id && !deletion && (
				<RetrieveDialog
					id={id}
					key_={hash.slice(1)}
					navigateHomeIfCancelled={!(bookId || searchText || book)}
					onShareDataReady={(shareData) => {
						setBookId(shareData.bookId);

						partialShareData.current =
							shareData.selection ? { selection: shareData.selection }
							: typeof shareData.pageNumber === "number" ?
								{ pageNumber: shareData.pageNumber }
							:	undefined;

						getBook({ bookId: shareData.bookId });
					}}
				/>
			)}

			{id && deletion && <DeleteDialog id={id} deleteToken={hash.slice(1)} />}

			<Privacy />

			{(mode === "browse" || mode === "search") && (
				<HighCapacityTextarea
					forwardedRef={textareaRef}
					value={mode === "search" ? searchText : bookId}
					placeholder={
						mode === "browse" ? "Enter a book ID" : "Enter search text"
					}
					// eslint-disable-next-line jsx-a11y/no-autofocus -- usefull in this case
					autoFocus
					onChange={(e) =>
						mode === "browse" ?
							onBookIdChange(e.target.value)
						:	onSearchTextChange(e.target.value)
					}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
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
				open={!!state.invalidDataDialogOpen}
				onOpenChange={(open) => {
					pushStateOrNavigateBack(open, { invalidDataDialogOpen: true });

					if (!open) {
						// Ensures the textarea is accessible by our code
						requestAnimationFrame(() => textareaRef.current?.focus());
					}
				}}
			/>

			{dataTruncated && (
				<SmallAlert>
					The {mode === "browse" ? "data" : "search text"} was too large and has
					been truncated.
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
						selection={book.selection}
						loadingBook={loadingBook}
						loadingGetBookInfo={
							loadingBookMetadata && bookMetadataPurpose.current === "book-info"
						}
						loadingShare={
							loadingBookMetadata && bookMetadataPurpose.current === "share"
						}
						onGetBookMetadataClick={() =>
							bookMetadata ?
								pushState({ bookMetadataDialogOpen: true })
							:	getBookMetadata("book-info")
						}
						onShareClick={() =>
							bookMetadata ?
								pushState({ shareDialogOpen: true })
							:	getBookMetadata("share")
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
						open={!!state.bookMetadataDialogOpen}
						onOpenChange={(open) =>
							pushStateOrNavigateBack(open, { bookMetadataDialogOpen: true })
						}
					/>

					<ShareDialog
						bookMetadata={bookMetadata}
						pageNumber={pageNumber}
						selection={book.selection}
						bookIdChanged={mode === "browse" && bookIdChanged.current}
						bookImageChanged={mode === "browse" && bookImageChanged.current}
						searchTextChanged={mode === "search" && searchTextChanged.current}
						open={!!state.shareDialogOpen}
						onOpenChange={(open) =>
							pushStateOrNavigateBack(open, { shareDialogOpen: true })
						}
					/>

					<BookPage
						lines={book.pages[pageNumber - 1].lines}
						pageNumber={pageNumber}
						selection={book.selection}
					/>

					<div className="mb-4 mt-12 w-[50%] border-b border-t py-1 text-center text-sm">
						<AboutDialogLink to="?about">How it works</AboutDialogLink>
					</div>
				</div>
			}

			<ComputationErrorDialog
				error={computationError}
				source={computationErrorSource}
				open={!!state.computationErrorDialogOpen}
				onOpenChange={(open) =>
					pushStateOrNavigateBack(open, { computationErrorDialogOpen: true })
				}
			/>

			{/* Displaying the full book isn't possible at the moment for performance issues,
			    because each space character is a `span` with a CSS gradient, and having
			    more than a million of them make the page very laggy, and can even crash.
			{book?.pages.map(({ key, pageNumber, lines }) => (
				<BookPage key={key} pageNumber={pageNumber} lines={lines} />
			))} */}
		</div>
	);
};

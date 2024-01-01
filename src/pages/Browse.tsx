import { Book, BookPage } from "@/components/BookPage";
import { Pagination } from "@/components/Pagination";
import { Privacy } from "@/components/Privacy";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkerContext } from "@/lib/WorkerContext.const";
import { Message } from "@/lib/worker";
import { useEffect, useState } from "react";

export const Browse = () => {
	const { worker } = useWorkerContext();

	const [bookId, setBookId] = useState<string>("");
	const [book, setBook] = useState<Book>([]);
	const [pageNumber, setPageNumber] = useState<number>(1);

	const convert = () => {
		const message: Message = {
			operation: "idtoContent",
			data: bookId,
		};

		worker.postMessage(message);
	};

	const onWorkerMessage = ({ data }: MessageEvent<Book>) => {
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
					value={bookId}
					placeholder="Enter a book ID"
					onChange={(e) => setBookId(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							convert();
						}
					}}
				/>
				<Privacy />
				ID length: {bookId.length}
			</div>

			<Button className="my-4" onClick={convert}>
				Retrieve the book
			</Button>

			{!book.length ? (
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
						pageNumber={pageNumber}
						lines={book[pageNumber - 1].lines}
						// showPageNumber
					/>
				</>
			)}

			{/* {book.map(({ key, pageNumber, lines }) => (
				<Page key={key} pageNumber={pageNumber} lines={lines} />
			))} */}
		</div>
	);
};

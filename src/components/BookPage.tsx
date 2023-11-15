export type Line = {
	key: string;
	chars: string;
};

export type Page = {
	key: string;
	pageNumber: number;
	lines: Line[];
};

export type Book = Page[];

export const Page = ({
	pageNumber,
	lines,
	showPageNumber,
}: Pick<Page, "pageNumber" | "lines"> & { showPageNumber?: boolean }) => (
	<div className="mt-4 flex flex-col items-center font-mono">
		{showPageNumber && <span>Page {pageNumber}/410</span>}

		<div className="mx-1 break-all rounded-md border p-2">
			{lines.map(({ chars, key }) => (
				<div key={key} className="max-lg:inline">
					{chars.split("").map((char, i) =>
						char === "·" ? (
							<span key={key + char + i} className="opacity-30">
								{char}
							</span>
						) : (
							char
						),
					)}
				</div>
			))}
		</div>
	</div>
);

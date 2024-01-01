import { cn } from "@/lib/utils";

export type Line = {
	chars: string;
};

export type Page = {
	key: string;
	pageNumber: number;
	lines: Line[];
};

export type Book = Page[];

export const BookPage = ({
	className,
	pageNumber,
	lines,
	showPageNumber,
}: Pick<Page, "pageNumber" | "lines"> & {
	className?: string;
	showPageNumber?: boolean;
}) => (
	<div className={cn("my-2 flex flex-col items-center font-mono", className)}>
		{showPageNumber && <span>Page {pageNumber}/410</span>}

		<div className="mx-1 break-all rounded-md border p-2">
			{
				// it's ok to use indexes for lines' and chars' keys, as lines and chars are rendered statelessly
				lines.map(({ chars }, lineIndex) => (
					<div key={lineIndex} className="max-lg:inline">
						{chars.split("").map((char, charIndex) =>
							char === "·" ? (
								<span key={charIndex} className="opacity-30">
									{char}
								</span>
							) : (
								char
							),
						)}
					</div>
				))
			}
		</div>
	</div>
);

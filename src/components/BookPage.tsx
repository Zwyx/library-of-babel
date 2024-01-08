import { cn } from "@/lib/utils";
import { memo } from "react";

export interface Line {
	chars: string;
}

export interface Page {
	key: string;
	pageNumber: number;
	lines: Line[];
}

export interface Book {
	pages: Page[];
	searchTextStart?: number;
	searchTextEnd?: number;
}

const isLineSelected = ({
	pageNumber,
	lineIndex,
	searchTextStart = 0,
	searchTextEnd = 0,
}: {
	pageNumber: number;
	lineIndex: number;
	searchTextStart?: number;
	searchTextEnd?: number;
}) => {
	const linePositions = (pageNumber - 1) * 3200 + lineIndex * 80;
	return (
		linePositions >= searchTextStart && linePositions + 79 <= searchTextEnd
	);
};

const isCharSelected = ({
	pageNumber,
	lineIndex,
	charIndex,
	searchTextStart = 0,
	searchTextEnd = 0,
}: {
	pageNumber: number;
	lineIndex: number;
	charIndex: number;
	searchTextStart?: number;
	searchTextEnd?: number;
}) => {
	const charPosition = (pageNumber - 1) * 3200 + lineIndex * 80 + charIndex;
	return charPosition >= searchTextStart && charPosition <= searchTextEnd;
};

export const BookPageComponent = ({
	className,
	lines,
	pageNumber,
	searchTextStart,
	searchTextEnd,
	showPageNumber,
}: Pick<Page, "pageNumber" | "lines"> & {
	className?: string;
	searchTextStart?: number;
	searchTextEnd?: number;
	showPageNumber?: boolean;
}) => {
	return (
		<div className={cn("my-2 flex flex-col items-center font-mono", className)}>
			{showPageNumber && <span>Page {pageNumber}/410</span>}

			<div className="mx-1 break-all rounded-md border p-2">
				{
					// it's ok to use indexes for lines' and chars' keys, as lines and chars are rendered statelessly
					lines.map(({ chars }, lineIndex) => {
						const lineSelected = isLineSelected({
							pageNumber,
							lineIndex,
							searchTextStart,
							searchTextEnd,
						});

						return (
							<div
								key={lineIndex}
								className={cn("max-lg:inline", lineSelected && "bg-blue-200")}
							>
								{chars.split("").map((char, charIndex) => {
									const charSelected = isCharSelected({
										pageNumber,
										lineIndex,
										charIndex,
										searchTextStart,
										searchTextEnd,
									});

									return (
										<span
											key={charIndex}
											className={cn(
												char === "·" && "text-gray-300 dark:text-gray-500",
												!lineSelected &&
													charSelected &&
													"inline-block bg-blue-200",
											)}
										>
											{char}
										</span>
									);
								})}
							</div>
						);
					})
				}
			</div>
		</div>
	);
};

export const BookPage = memo(BookPageComponent);

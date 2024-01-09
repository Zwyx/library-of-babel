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
	searchTextStart,
	searchTextEnd,
}: {
	pageNumber: number;
	lineIndex: number;
	charIndex: number;
	searchTextStart?: number;
	searchTextEnd?: number;
}) => {
	if (
		typeof searchTextStart !== "number" ||
		typeof searchTextEnd !== "number"
	) {
		return false;
	}

	const charPosition = (pageNumber - 1) * 3200 + lineIndex * 80 + charIndex;
	return charPosition >= searchTextStart && charPosition <= searchTextEnd;
};

export const BookPageComponent = ({
	className,
	lines,
	pageNumber,
	searchTextStart,
	searchTextEnd,
}: Pick<Page, "pageNumber" | "lines"> & {
	className?: string;
	searchTextStart?: number;
	searchTextEnd?: number;
}) => {
	return (
		<div
			className={cn(
				"mx-1 whitespace-break-spaces break-all rounded-md border p-2 font-mono",
				className,
			)}
		>
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
							className={cn(
								"max-lg:inline",
								lineSelected && "bg-blue-200 dark:bg-blue-900",
							)}
						>
							{/* create a setting for that: */}
							{/* <span className="mr-2 select-none text-sm text-muted-foreground max-lg:hidden">*/}
							{/* eslint-disable-next-line no-irregular-whitespace */}
							{/* {`${lineIndex + 1}`.padStart(2, " ")}
								</span> */}

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
											char === " " &&
												"bg-[radial-gradient(circle,_#bbb_0,_transparent_.1rem)] dark:bg-[radial-gradient(circle,_#555_0,_transparent_.1rem)]",
											!lineSelected &&
												charSelected &&
												"inline-block bg-blue-200 dark:bg-blue-900",
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
	);
};

export const BookPage = memo(BookPageComponent);

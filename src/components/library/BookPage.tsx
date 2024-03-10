import { Line } from "@/lib/common";
import { SHOW_LINE_NUMBERS_KEY } from "@/lib/keys";
import { cn, isElementInViewport } from "@/lib/utils";
import { memo, useEffect } from "react";
import { useReadLocalStorage } from "usehooks-ts";

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

/**
 * Return:
 * - 0 if char is not supposed to be selected
 * - 1 if char is the first one to be selected
 * - 2 if char is another one to be selected
 */
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
	searchTextStart: number | undefined;
	searchTextEnd: number | undefined;
}): 0 | 1 | 2 => {
	if (
		typeof searchTextStart !== "number" ||
		typeof searchTextEnd !== "number" ||
		searchTextEnd < 0
	) {
		return 0;
	}

	const charPosition = (pageNumber - 1) * 3200 + lineIndex * 80 + charIndex;

	return (
		charPosition === searchTextStart ? 1
		: charPosition > searchTextStart && charPosition <= searchTextEnd ? 2
		: 0
	);
};

const FIRST_SELECTED_CHAR_ID = "first-selected-char";

export const BookPageComponent = ({
	className,
	lines,
	pageNumber,
	searchTextStart,
	searchTextEnd,
}: {
	className?: string;
	lines: Line[];
	pageNumber: number;
	searchTextStart?: number;
	searchTextEnd?: number;
}) => {
	const showLineNumbers = !!useReadLocalStorage(SHOW_LINE_NUMBERS_KEY);

	useEffect(() => {
		if (typeof searchTextStart === "number") {
			// Ensures element has been added in the DOM
			requestAnimationFrame(() => {
				const element = document.getElementById(FIRST_SELECTED_CHAR_ID);

				if (element && !isElementInViewport(element)) {
					element?.scrollIntoView({ block: "center", behavior: "smooth" });
				}
			});
		}
	}, [lines, searchTextStart]);

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
							{showLineNumbers && (
								<span className="mr-2 select-none text-sm text-muted-foreground max-lg:hidden">
									{`${lineIndex + 1}`.padStart(2, " ")}
								</span>
							)}

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
										id={charSelected === 1 ? FIRST_SELECTED_CHAR_ID : undefined}
										className={cn(
											char === " " &&
												"bg-[radial-gradient(circle,_#bbb_0,_transparent_.1rem)] dark:bg-[radial-gradient(circle,_#555_0,_transparent_.1rem)]",
											!lineSelected &&
												charSelected &&
												"inline-block bg-blue-200 dark:bg-blue-800",
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

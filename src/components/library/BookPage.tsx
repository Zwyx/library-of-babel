import { Line, Selection } from "@/lib/common";
import {
	SELECT_SEARCHED_TEXT_KEY,
	SHOW_LINE_NUMBERS_KEY,
} from "@/lib/local-storage-keys";
import { cn, isElementInViewport } from "@/lib/utils";
import { memo, useEffect } from "react";
import { useReadLocalStorage } from "usehooks-ts";

const isLineSelected = ({
	pageNumber,
	lineIndex,
	selection,
}: {
	pageNumber: number;
	lineIndex: number;
	selection: Selection | undefined;
}): boolean => {
	if (!selection || selection.end === null) {
		return false;
	}

	const linePositions = (pageNumber - 1) * 3200 + lineIndex * 80;

	return (
		linePositions >= selection.start && linePositions + 79 <= selection.end
	);
};

/**
 * Return:
 * - 0 if char is not supposed to be selected
 * - 1 if char is the first one to be selected
 * - 2 if char is another one to be selected
 */
const getCharSelectionState = ({
	pageNumber,
	lineIndex,
	charIndex,
	selection,
}: {
	pageNumber: number;
	lineIndex: number;
	charIndex: number;
	selection: Selection | undefined;
}): 0 | 1 | 2 => {
	if (!selection || selection.end === null) {
		return 0;
	}

	const charPosition = (pageNumber - 1) * 3200 + lineIndex * 80 + charIndex;

	return (
		charPosition === selection.start ? 1
		: charPosition > selection.start && charPosition <= selection.end ? 2
		: 0
	);
};

const FIRST_SELECTED_CHAR_ID = "first-selected-char";

export const BookPageComponent = ({
	className,
	lines,
	pageNumber,
	selection,
}: {
	className?: string;
	lines: Line[];
	pageNumber: number;
	selection?: Selection;
}) => {
	const showLineNumbers = !!useReadLocalStorage(SHOW_LINE_NUMBERS_KEY);
	const selectSearchedText =
		useReadLocalStorage(SELECT_SEARCHED_TEXT_KEY) ?? true;

	useEffect(() => {
		if (selectSearchedText && selection) {
			// Ensures element has been added in the DOM
			requestAnimationFrame(() => {
				const element = document.getElementById(FIRST_SELECTED_CHAR_ID);

				if (element && !isElementInViewport(element)) {
					element?.scrollIntoView({ block: "center", behavior: "smooth" });
				}
			});
		}
	}, [selectSearchedText, selection]);

	const selectionColors = "bg-blue-200 dark:bg-blue-900";

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
					const lineSelected =
						selectSearchedText &&
						isLineSelected({
							pageNumber,
							lineIndex,
							selection,
						});

					return (
						<div
							key={lineIndex}
							className={cn("max-lg:inline", lineSelected && selectionColors)}
						>
							{showLineNumbers && (
								<span className="mr-2 select-none text-sm text-muted-foreground max-lg:hidden">
									{`${lineIndex + 1}`.padStart(2, " ")}
								</span>
							)}

							{chars.split("").map((char, charIndex) => {
								const charSelected =
									selectSearchedText &&
									getCharSelectionState({
										pageNumber,
										lineIndex,
										charIndex,
										selection,
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
												cn("inline-block", selectionColors),
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

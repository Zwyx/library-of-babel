import { PAGES_PER_BOOK } from "@/lib/common";
import { cn } from "@/lib/utils";
import {
	LucideChevronFirst,
	LucideChevronLast,
	LucideChevronLeft,
	LucideChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Pagination = ({
	className,
	min,
	max,
	pageNumber,
	disabled,
	onChange,
}: {
	className?: string;
	min: number;
	max: number;
	pageNumber: number;
	disabled?: boolean;
	onChange: (now: number) => void;
}) => {
	const [rawPageNumber, setRawPageNumber] = useState<string | number>(
		pageNumber,
	);

	useEffect(() => setRawPageNumber(pageNumber), [pageNumber]);

	return (
		<div
			className={cn(
				"sticky top-0 z-10 flex gap-2 rounded bg-background shadow-[0_0_16px_8px] shadow-background",
				className,
			)}
		>
			<Button
				variant="secondary"
				size="sm"
				disabled={disabled || pageNumber === 1}
				onClick={() => {
					onChange(min);
					setRawPageNumber(min);
				}}
			>
				<LucideChevronFirst />
			</Button>

			<Button
				variant="secondary"
				size="sm"
				disabled={disabled || pageNumber === 1}
				onClick={() => {
					onChange(pageNumber - 1);
					setRawPageNumber(pageNumber - 1);
				}}
			>
				<LucideChevronLeft />
			</Button>

			<Input
				className="w-[5.5rem]"
				variantSize="sm"
				type="number"
				min={min}
				max={max}
				value={rawPageNumber}
				disabled={disabled}
				onChange={(e) => {
					const newRawPageNumber = e.target.value;
					const newPageNumber = parseInt(newRawPageNumber);

					if (newPageNumber >= min && newPageNumber <= max) {
						onChange(newPageNumber);
					}

					setRawPageNumber(newRawPageNumber);
				}}
			/>

			<Button
				variant="secondary"
				size="sm"
				disabled={disabled || pageNumber === PAGES_PER_BOOK}
				onClick={() => {
					onChange(pageNumber + 1);
					setRawPageNumber(pageNumber + 1);
				}}
			>
				<LucideChevronRight />
			</Button>

			<Button
				variant="secondary"
				size="sm"
				disabled={disabled || pageNumber === PAGES_PER_BOOK}
				onClick={() => {
					onChange(max);
					setRawPageNumber(max);
				}}
			>
				<LucideChevronLast />
			</Button>
		</div>
	);
};

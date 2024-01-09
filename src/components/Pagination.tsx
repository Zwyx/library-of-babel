import { cn } from "@/lib/utils";
import {
	LucideChevronFirst,
	LucideChevronLast,
	LucideChevronLeft,
	LucideChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Pagination = ({
	className,
	min,
	max,
	current,
	loading,
	onChange,
}: {
	className?: string;
	min: number;
	max: number;
	current: number;
	loading?: boolean;
	onChange: (now: number) => void;
}) => {
	const [value, setValue] = useState<string | number>(current);

	useEffect(() => setValue(current), [current]);

	return (
		<div
			className={cn(
				"sticky top-0 z-10 flex gap-2 rounded bg-background shadow-[0_0_16px_8px] shadow-background",
				className,
			)}
		>
			<Button
				variant="secondary"
				disabled={loading || current === 1}
				onClick={() => {
					onChange(min);
					setValue(min);
				}}
			>
				<LucideChevronFirst />
			</Button>

			<Button
				variant="secondary"
				disabled={loading || current === 1}
				onClick={() => {
					const newValue = current - 1;

					if (newValue >= min) {
						onChange(newValue);
						setValue(newValue);
					}
				}}
			>
				<LucideChevronLeft />
			</Button>

			<Input
				type="number"
				min={min}
				max={max}
				value={value}
				disabled={loading}
				onChange={(e) => {
					const rawValue = e.target.value;
					const int = parseInt(rawValue);

					if (int >= min && int <= max) {
						onChange(int);
					}

					setValue(rawValue);
				}}
			/>

			<Button
				variant="secondary"
				disabled={loading || current === 410}
				onClick={() => {
					const newValue = current + 1;

					if (newValue <= max) {
						onChange(newValue);
						setValue(newValue);
					}
				}}
			>
				<LucideChevronRight />
			</Button>

			<Button
				variant="secondary"
				disabled={loading || current === 410}
				onClick={() => {
					onChange(max);
					setValue(max);
				}}
			>
				<LucideChevronLast />
			</Button>
		</div>
	);
};

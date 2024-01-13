import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export const Code = ({
	className,
	display,
	numbersOnly,
	children,
}: {
	className?: string;
	display?: "inline" | "block";
	numbersOnly?: boolean;
} & PropsWithChildren) => (
	<code
		className={cn(
			"break-all rounded border bg-gray-100 px-1 py-0.5 dark:border-gray-700 dark:bg-gray-800",
			numbersOnly && "pt-1",
			display === "block" && "block px-2 py-1",
			display === "block" && numbersOnly && "px-3 pb-0 pt-0.5",
			className,
		)}
	>
		{children}
	</code>
);

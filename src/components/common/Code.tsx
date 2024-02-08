import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export const Code = ({
	className,
	block,
	breakAll,
	numbersOnly,
	children,
}: {
	className?: string;
	block?: boolean;
	breakAll?: boolean;
	numbersOnly?: boolean;
} & PropsWithChildren) => (
	<code
		className={cn(
			"rounded border bg-gray-100 px-1 py-0.5 dark:border-gray-700 dark:bg-gray-800",
			numbersOnly && "pt-1",
			block && "block px-2 py-1",
			block && numbersOnly && "px-3 pb-0 pt-0.5",
			breakAll && "break-all",
			className,
		)}
	>
		{children}
	</code>
);

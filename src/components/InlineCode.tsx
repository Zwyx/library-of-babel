import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export const InlineCode = ({
	className,
	children,
}: { className?: string } & PropsWithChildren) => (
	<code
		className={cn(
			"break-all rounded border bg-gray-100 px-1 py-0.5 dark:border-gray-700 dark:bg-gray-800",
			className,
		)}
	>
		{children}
	</code>
);

import { cn } from "@/lib/utils";
import { LucideAlertTriangle } from "lucide-react";
import { PropsWithChildren } from "react";

export const SmallAlert = ({
	className,
	children,
}: { className?: string } & PropsWithChildren) => {
	return (
		<div
			className={cn(
				"flex items-center justify-center gap-2 pt-1 text-sm font-semibold text-warning",
				className,
			)}
		>
			<LucideAlertTriangle className="flex-shrink-0" size={20} />
			{children}
		</div>
	);
};

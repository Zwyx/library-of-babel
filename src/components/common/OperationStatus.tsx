import { cn } from "@/lib/utils";
import { LucideCheck, LucideLoader2, LucideMinus } from "lucide-react";
import { PropsWithChildren } from "react";

export const OperationStatusGroup = ({
	className,
	children,
}: {
	className?: string;
} & PropsWithChildren) => (
	<div
		className={cn(
			"flex flex-col items-center gap-2 py-4 text-sm text-muted-foreground",
			className,
		)}
	>
		{children}
	</div>
);

export const OperationStatus = ({
	className,
	label,
	status,
}: {
	className?: string;
	label: string;
	status: "idle" | "running" | "success";
}) => (
	<div className={cn("flex items-center gap-2", className)}>
		<span className={cn(status === "idle" && "text-muted-text")}>{label}</span>

		{status === "running" ?
			<LucideLoader2 className="h-4 w-4 animate-spin text-info-dim" />
		: status === "success" ?
			<LucideCheck className="h-4 w-4 text-success-dim" />
		:	<LucideMinus className="h-4 w-4 text-muted-text" />}
	</div>
);

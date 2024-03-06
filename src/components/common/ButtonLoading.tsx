import { cn } from "@/lib/utils";
import { LucideLoader2 } from "lucide-react";
import { Button, ButtonProps } from "../ui/button";

export const ButtonLoading = ({
	className,
	disabled,
	loading,
	children,
	...props
}: { loading?: boolean } & ButtonProps) => {
	return (
		<Button
			className={cn("relative", className)}
			disabled={disabled || loading}
			{...props}
		>
			<div className={cn(loading && "invisible")}>{children}</div>

			<LucideLoader2
				className={cn(
					"absolute h-4 w-4",
					!loading && "invisible",
					loading && "animate-spin",
				)}
			/>
		</Button>
	);
};

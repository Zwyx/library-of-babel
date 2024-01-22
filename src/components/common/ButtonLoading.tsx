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
			<span className={cn(loading && "invisible")}>{children}</span>

			<LucideLoader2
				className={cn("absolute h-4 w-4 animate-spin", !loading && "invisible")}
			/>
		</Button>
	);
};

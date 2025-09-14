import { cn } from "@/lib/utils";
import { LucideLoader2 } from "lucide-react";
import { Ref, forwardRef } from "react";
import { Button, ButtonProps } from "../ui/button";
import "./ButtonStatus.css";

export const ButtonStatus = forwardRef(function ButtonStatus(
	{
		className,
		disabled,
		loading,
		success,
		children,
		...props
	}: {
		loading?: boolean;
		success?: boolean;
	} & ButtonProps,
	ref: Ref<HTMLButtonElement>,
) {
	const hideChildren = loading || success;

	return (
		<Button
			ref={ref}
			className={cn("relative", success && "disabled:opacity-100", className)}
			disabled={disabled || hideChildren}
			{...props}
		>
			<div className={cn(hideChildren && "invisible")}>{children}</div>

			<LucideLoader2
				className={cn(
					"absolute",
					!loading && "hidden",
					loading && "animate-spin",
				)}
			/>

			<svg
				className={cn(
					"pointer-events-none absolute z-20 animate-[showIcon_2s_ease-in-out_forwards] stroke-success-dim",
					!success && "hidden",
				)}
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path className="pathCheck" d="m6,15 l3,3 L19,8" />
			</svg>
		</Button>
	);
});

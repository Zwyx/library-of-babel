import { cn } from "@/lib/utils";
import { RefObject, TextareaHTMLAttributes } from "react";
import { Textarea } from "../ui/textarea";

export const HighCapacityTextarea = ({
	forwardedRef,
	className,
	...props
}: {
	forwardedRef?: RefObject<HTMLTextAreaElement>;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) => {
	return (
		<Textarea
			ref={forwardedRef}
			className={cn("resize-none break-all font-mono", className)}
			spellCheck={false} // for performance
			autoComplete="off" // for performance
			{...props}
		/>
	);
};

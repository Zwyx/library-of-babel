import { cn } from "@/lib/utils";
import "./ButtonSuccess.css";
import { Button, ButtonProps } from "./ui/button";

export const ButtonSuccess = ({
	showSuccess,
	...props
}: { showSuccess?: boolean } & ButtonProps) => {
	return (
		<div className="relative z-20 flex justify-center">
			<svg
				className={cn(
					"pointer-events-none absolute animate-[showIcon_2s_ease-in-out_forwards] stroke-green-500",
					!showSuccess && "hidden",
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
				<path className="pathCircle" d="M16,2 a10,10,0,1,0,6,10" />
				<path className="pathCheck" d="m9,11 l3,3 L22,4" />
			</svg>

			<Button {...props} />
		</div>
	);
};

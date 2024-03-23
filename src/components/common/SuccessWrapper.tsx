import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
import "./SuccessWrapper.css";

export const SuccessWrapper = ({
	showSuccess,
	children,
}: { showSuccess?: boolean } & PropsWithChildren) => {
	return (
		<div className="relative flex justify-end">
			<svg
				className={cn(
					"pointer-events-none absolute z-20 animate-[showIcon_2s_ease-in-out_forwards] stroke-success-dim",
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
				{/* <path className="pathCircle" d="M16,2 a10,10,0,1,0,6,10" /> */}
				<path className="pathCheck" d="m9,11 l3,3 L22,4" />
			</svg>

			{children}
		</div>
	);
};

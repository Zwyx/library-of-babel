import { Progress } from "@/lib/pb";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const ProgressStatus = ({
	className,
	progress,
}: {
	className?: string;
	progress?: Progress;
}) => {
	const firstRender = useRef<boolean>(true);

	const [success, setSuccess] = useState<boolean>(false);

	const percentage =
		progress ? Math.min((progress.loaded * 100) / progress.total, 100) : 0;

	useEffect(() => {
		firstRender.current = false;
	}, [percentage]);

	useEffect(() => {
		if (percentage === 100) {
			setTimeout(() => setSuccess(true), 150);
		}
	}, [percentage]);

	return (
		<div className={cn("w-full px-1", className)}>
			<div
				style={{
					width: `${percentage}%`,
				}}
				className={cn(
					"h-1 rounded bg-info-dim transition-all",
					success && "h-0 bg-success-dim",

					// Hide the progress bar if we're returning of the loading view after showing
					// the `Decryption key` form
					firstRender.current && percentage === 100 && "h-0",
				)}
			/>
		</div>
	);
};

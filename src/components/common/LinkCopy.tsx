import { cn, copyToClipboard } from "@/lib/utils";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SuccessWrapper } from "./SuccessWrapper";

export const LinkCopy = ({
	className,
	link,
	buttonLabel,
}: {
	className?: string;
	link: string;
	buttonLabel: string;
}) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);

	return (
		<div className={cn("flex", className)}>
			<Input
				ref={inputRef}
				className="flex-1 text-ellipsis rounded-br-none rounded-tr-none border-r-0 caret-transparent focus:z-10"
				readOnly
				value={link}
				onFocus={() => inputRef.current?.select()}
			/>

			<SuccessWrapper showSuccess={showCopySuccess}>
				<Button
					className="shrink-0 rounded-bl-none rounded-tl-none border"
					variant="secondary"
					onClick={() =>
						copyToClipboard(link).then(() => {
							if (!showCopySuccess) {
								setShowCopySuccess(true);
								setTimeout(() => setShowCopySuccess(false), 2000);
							}
						})
					}
				>
					{buttonLabel}
				</Button>
			</SuccessWrapper>
		</div>
	);
};

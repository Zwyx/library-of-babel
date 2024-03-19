import { cn } from "@/lib/utils";
import { ButtonLoading } from "./ButtonLoading";
import { FetchErrorType } from "./FetchError.const";

export const FetchError = ({
	className,
	type,
	loading,
	onRetryClick,
}: {
	className?: string;
	type: FetchErrorType;
	loading?: boolean;
	onRetryClick?: () => void;
}) => {
	return (
		<div className={cn("flex flex-col items-center gap-2", className)}>
			<div className="text-center text-destructive">
				<div className="font-semibold">
					{type === "network-error" ?
						"Error"
					: type === "server-error" ?
						"Server error"
					:	"Not found"}
				</div>

				<div className="mt-2">
					{type === "network-error" ?
						"Please check your internet connection and try again."
					: type === "server-error" ?
						"Please try again later. Sorry for the inconvenience."
					:	"This link is invalid, has expired or has been deleted."}
				</div>
			</div>

			{type === "network-error" && (
				<ButtonLoading
					className="mt-4"
					variant="outline"
					loading={loading}
					onClick={onRetryClick}
				>
					Try again
				</ButtonLoading>
			)}
		</div>
	);
};

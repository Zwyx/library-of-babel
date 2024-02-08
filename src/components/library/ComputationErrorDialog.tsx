import { AboutDialogLink } from "@/components/library/about/AboutDialog";
import { Code } from "../common/Code";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

export const ComputationErrorDialog = ({
	error,
	open,
	onOpenChange,
}: {
	error?: string;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-destructive">
				<DialogHeader>
					<DialogTitle className="text-destructive">Error</DialogTitle>
				</DialogHeader>

				<div>
					<div>
						An error occurred while computing. This is probably a limitation of
						the device/browser you're using.{" "}
						<AboutDialogLink to="?about#browsers-limitations">
							Read more
						</AboutDialogLink>
						.
					</div>

					<div className="mt-4">
						Try again by generating no more than the first 67 pages of a book.
					</div>

					{error && (
						<>
							<div className="mt-4">Error details:</div>

							<Code className="mt-1" block>
								{error}
							</Code>
						</>
					)}
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

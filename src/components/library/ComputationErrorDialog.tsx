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

				<div className="my-2">
					<div>
						An error occurred while computing. This is probably a limitation of
						your web browser.{" "}
						<AboutDialogLink to="?about=browsers-limitations">
							Read more
						</AboutDialogLink>
					</div>

					<div className="mt-6">
						Try again by selecting to return a book with no more than 67 pages
						of text.
					</div>

					{error && (
						<>
							<div className="mt-6">Error details:</div>

							<Code className="mt-2" block>
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

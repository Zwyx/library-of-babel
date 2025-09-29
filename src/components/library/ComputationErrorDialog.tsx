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

export type ComputationErrorSource = "local" | "shared";

export const ComputationErrorDialog = ({
	error,
	source,
	open,
	onOpenChange,
}: {
	error?: string;
	source: ComputationErrorSource;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-destructive" noDescription>
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
						{source === "shared" ?
							<>
								Try with another browser, or ask the creator of this link to
								make another one after adjusting the settings to return a book
								with no more than 67 pages of text.
							</>
						:	<>
								Try again after adjusting the settings to return a book with no
								more than 67 pages of text.
							</>
						}
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

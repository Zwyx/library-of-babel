import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { BASE_81_ALPHABET, LibraryMode } from "@/lib/common";
import { Code } from "../common/Code";
import { Button } from "../ui/button";

export const InvalidDataDialog = ({
	mode,
	open,
	onOpenChange,
}: {
	mode: LibraryMode;
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "browse" ? "Invalid book ID" : "Invalid search text"}
					</DialogTitle>
				</DialogHeader>

				{mode === "browse" && (
					<>
						<div>
							The book ID contains only invalid characters, please enter a valid
							book ID.
						</div>

						<div>Valid characters are:</div>

						<Code display="block">{BASE_81_ALPHABET}</Code>
					</>
				)}

				{mode === "search" && (
					<>
						<div>
							The search text contains only invalid characters, please enter
							valid ones.
						</div>

						<div>
							Valid characters are the space, the letters{" "}
							<Code>abcdefghijklmnopqrstuvwxyz</Code>, the comma, and the
							period.
						</div>
					</>
				)}

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

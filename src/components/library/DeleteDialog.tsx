import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PB_ID_REGEX, deleteFromPb } from "@/lib/pb";
import { LucideAlertOctagon, LucideCheck, LucideLoader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code } from "../common/Code";
import { RequestError } from "../common/RequestError";
import {
	RequestErrorType,
	isRequestErrorType,
} from "../common/RequestError.const";

/**
 * Note: do not place any `AboutDialogLink`s in this dialog, as clicking
 * them would remove the delete token from a shared link
 */
export const DeleteDialog = ({
	id,
	deleteToken,
}: {
	id: string;
	deleteToken: string;
}) => {
	const navigate = useNavigate();

	const [view, setView] = useState<
		| "invalid-link"
		| "delete-confirmation"
		| "deleting"
		| RequestErrorType
		| "wrong-delete-token"
		| "finished"
	>();

	const deleteData = async () => {
		setView("deleting");

		const json = await deleteFromPb(id, deleteToken);

		if ("error" in json) {
			setView(json.error);
		} else {
			setView("finished");
		}
	};

	useEffect(() => {
		if (!PB_ID_REGEX.test(id) || !deleteToken) {
			setView("invalid-link");
		} else {
			setView("delete-confirmation");
		}
	}, [deleteToken, id]);

	return (
		<>
			<Dialog open>
				<DialogContent
					className="max-h-full max-w-xl gap-0 overflow-auto"
					notClosable
				>
					<DialogHeader>
						<DialogTitle>Delete a shared book</DialogTitle>

						<DialogDescription>
							Renders the book's access link unusable.
						</DialogDescription>
					</DialogHeader>

					{view === "invalid-link" && (
						<div className="my-6 flex flex-col gap-2 text-center text-destructive">
							<div className="font-semibold">Error</div>
							The provided link is invalid.
						</div>
					)}

					{view === "delete-confirmation" && (
						<>
							<Alert className="mt-6" variant="destructive">
								<LucideAlertOctagon className="h-4 w-4" />

								<AlertTitle>This book will be lost</AlertTitle>

								<AlertDescription>
									The encrypted data associated to this link will be deleted.
									This cannot be undone.
								</AlertDescription>
							</Alert>

							<Button
								className="mt-6 sm:mx-auto sm:w-fit"
								variant="destructive"
								onClick={deleteData}
							>
								Confirm deletion
							</Button>
						</>
					)}

					{(view === "deleting" || view === "finished") && (
						<div className="mt-6 flex flex-col items-center gap-2 py-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<span>Deleting encrypted data</span>

								{view === "deleting" ?
									<LucideLoader2 className="h-4 w-4 animate-spin text-info-dim" />
								:	<LucideCheck className="h-4 w-4 text-success-dim" />}
							</div>

							{view === "finished" && (
								<Alert className="mt-2" variant="success">
									<LucideCheck className="h-4 w-4" />

									<AlertTitle>
										This book has been deleted successfully.
									</AlertTitle>
								</Alert>
							)}
						</div>
					)}

					{isRequestErrorType(view) && (
						<RequestError
							className="mt-6"
							type={view}
							onRetryClick={deleteData}
						/>
					)}

					{view === "wrong-delete-token" && (
						<Alert className="mb-6 mt-12" variant="destructive">
							<LucideAlertOctagon className="h-4 w-4" />

							<AlertTitle>Error</AlertTitle>

							<AlertDescription>
								This link's delete token — the part following <Code>#</Code> —
								is invalid. The book has not been deleted.
							</AlertDescription>
						</Alert>
					)}

					<DialogFooter className="mt-6">
						<Button
							variant="secondary"
							disabled={view === "deleting"}
							onClick={() => navigate("/")}
						>
							{(
								view === "delete-confirmation" ||
								view === "deleting" ||
								view === "network-error"
							) ?
								"Cancel"
							:	"Close"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

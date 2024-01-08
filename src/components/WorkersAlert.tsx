import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideAlertOctagon } from "lucide-react";

export const WorkersAlert = () => {
	const workersAvailable = !!window.Worker;

	return (
		!workersAvailable && (
			<Alert className="max-w-[750px]" variant="destructive">
				<LucideAlertOctagon className="h-4 w-4" />
				<AlertTitle>Missing feature</AlertTitle>
				<AlertDescription>
					Your device or browser doesn't support web workers, which are required
					for this app to run. Please open the Library of Babel on another
					device or browser.
				</AlertDescription>
			</Alert>
		)
	);
};

import { Link } from "react-router-dom";

export const Privacy = () => {
	return (
		<div className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
			<div>
				Your privacy is safe, this app works entirely offline.{" "}
				<Link
					// TODO: its focus is between the text area and the "Retrieve the book" button, sort it out with tabIndex, or remove it
					to=""
				>
					offline
				</Link>
				.
			</div>
		</div>
	);
};

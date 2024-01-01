import { LucideInfo } from "lucide-react";
import { Link } from "react-router-dom";

export const Privacy = () => {
	return (
		<div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
			<LucideInfo size="1em" />
			<div>
				Your privacy is safe – this app works <Link to="">offline</Link>.
			</div>
		</div>
	);
};

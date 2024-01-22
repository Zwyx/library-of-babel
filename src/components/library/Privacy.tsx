import { AboutDialogLink } from "@/components/library/about/AboutDialog";
import { PRIVACY_BANNER_KEY } from "@/lib/keys";
import { LucideX } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "../ui/button";

export const Privacy = () => {
	const [bannerState, setBannerState] = useLocalStorage<"" | "hide">(
		PRIVACY_BANNER_KEY,
		"",
	);

	const hideBanner = () => setBannerState("hide");

	return (
		bannerState !== "hide" && (
			<div className="flex w-full items-center justify-between gap-1 rounded bg-muted px-1 text-center text-xs text-muted-foreground">
				<div className="flex-1">
					Your privacy is safe, this app works entirely{" "}
					<AboutDialogLink to="?about#tbd" onClick={hideBanner}>
						offline
					</AboutDialogLink>
					.
				</div>

				<Button variant="ghost" size="2xs" onClick={hideBanner}>
					<LucideX size={12} />
				</Button>
			</div>
		)
	);
};

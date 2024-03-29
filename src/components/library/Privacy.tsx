import { PRIVACY_BANNER_KEY } from "@/lib/local-storage-keys";
import { LucideX } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "../ui/button";
import { AboutDialogLink } from "./about/AboutDialog";

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
					Your privacy is respected, calculations are made{" "}
					<AboutDialogLink to="?about=privacy" onClick={hideBanner}>
						entirely on your device
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

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { usePwaContext } from "@/lib/PwaContext.const";
import { PopoverArrow, PopoverClose } from "@radix-ui/react-popover";
import { LucideRefreshCw, LucideX } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export const PwaRefresher = () => {
	const { needsRefresh, refresh } = usePwaContext();
	const [popoverOpen, setPopoverOpen] = useState<boolean>(true);

	return (
		needsRefresh && (
			<Popover open={popoverOpen}>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="icon" onClick={refresh}>
						<div className="relative">
							<LucideRefreshCw />

							<span className="absolute left-[-8px] top-[-8px] flex h-3 w-3">
								<span className="absolute h-full w-full animate-ping rounded-full bg-info opacity-75" />
								<span className="absolute left-[2px] top-[2px] h-2 w-2 rounded-full bg-info" />
							</span>
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent className="flex items-start justify-between border-info-dim">
					<div>
						<div className="flex-1">New version available</div>
						<div className="text-sm text-muted-foreground">
							Reload the app to update.
						</div>
					</div>

					<PopoverClose onClick={() => setPopoverOpen(false)}>
						<LucideX className="h-4 w-4 text-muted-foreground" />
					</PopoverClose>
					<PopoverArrow className="fill-info-dim" />
				</PopoverContent>
			</Popover>
		)
	);
};

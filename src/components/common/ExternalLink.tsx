import { cn } from "@/lib/utils";
import { LucideExternalLink } from "lucide-react";
import { PropsWithChildren } from "react";

export const ExternalLink = ({
	className,
	href,
	showIcon,
	children,
}: {
	className?: string;
	href: string;
	showIcon?: boolean;
} & PropsWithChildren) => {
	return (
		<a
			className={cn("inline-flex", className)}
			href={href}
			target="_blank"
			rel="noreferrer nofollow"
		>
			<span className="font-semibold">{children}</span>
			{showIcon && (
				<LucideExternalLink className="ml-0.5 h-[0.75rem] w-[0.75rem] stroke-[2.5]" />
			)}
		</a>
	);
};

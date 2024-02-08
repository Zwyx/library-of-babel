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
			className={cn("inline-flex items-start", className)}
			href={href}
			target="_blank"
			rel="noreferrer nofollow"
		>
			<span className="font-semibold">{children}</span>
			{showIcon && <LucideExternalLink className="h-[0.875rem] stroke-[1.7]" />}
		</a>
	);
};

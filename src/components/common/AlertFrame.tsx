import { PropsWithChildren } from "react";

export const AlertFrame = ({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
} & PropsWithChildren) => {
	return (
		<div className="mt-2 flex w-full flex-col items-center gap-1 rounded-md border border-info bg-info/10 p-2 text-center">
			<div className="w-full">{title}</div>

			<div className="w-full text-sm text-muted-foreground">{description}</div>

			{children}
		</div>
	);
};

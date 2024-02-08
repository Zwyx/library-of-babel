import { PropsWithChildren } from "react";
import { Code } from "./Code";

const format = (text: string) =>
	// eslint-disable-next-line no-irregular-whitespace
	text.replace(/\*/g, "×").replace(/ /g, " ").replace(/ = /g, " = ");

export const Math = ({
	className,
	breakAll,
	block,
	children,
}: {
	className?: string;
	breakAll?: boolean;
	block?: boolean;
} & PropsWithChildren) => {
	return (
		<Code className={className} block={block} breakAll={breakAll}>
			{typeof children === "string" ?
				format(children)
			: Array.isArray(children) ?
				children.map((child) =>
					typeof child === "string" ? format(child) : child,
				)
			:	children}
		</Code>
	);
};

import { Link, LinkProps } from "react-router";

interface HistoryStateLinkProps<T> extends LinkProps {
	state?: T;
}

export function HistoryStateLink<T>(props: HistoryStateLinkProps<T>) {
	return (
		<Link
			{...{
				...props,
				...(props.state ?
					{ state: { ...(history.state?.usr || {}), ...props.state } }
				:	{ state: history.state?.usr || {} }),
			}}
		/>
	);
}

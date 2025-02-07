import { Link, LinkProps } from "react-router-dom";

interface HistoryStateLinkProps<T> extends LinkProps {
	state?: T;
}

export function HistoryStateLink<T>(props: HistoryStateLinkProps<T>) {
	return <Link {...props} />;
}

// Was extracted from the main file to allow React Refresh to work
// (see ESLint `react-refresh/only-export-components`);
// it doesn't seem to work though, we still see `hmr invalidate` warnings,
// maybe because it doesn't work with hooks

import { Link, LinkProps } from "react-router-dom";

interface HistoryStateLinkProps<T> extends LinkProps {
	state?: T;
}

export function HistoryStateLink<T>(props: HistoryStateLinkProps<T>) {
	return <Link {...props} />;
}

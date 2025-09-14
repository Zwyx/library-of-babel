// Was extracted from the main file for React Refresh (see ESLint `react-refresh/only-export-components`)

import { useCallback } from "react";
import {
	Location,
	NavigateOptions,
	To,
	useLocation,
	useNavigate,
} from "react-router";
import { HistoryStateLink } from "./useHistoryState";

interface HistoryNavigateOptions<T> extends NavigateOptions {
	state?: T;
}

interface HistoryNavigateToFunction<T> {
	(to: To, options?: HistoryNavigateOptions<T>): void | Promise<void>;
}

/**
 * Every time `history.state.usr` is access, we do `history.state?.usr || {}` instead,
 * because of the error `null is not an object (evaluating 'history.state.usr')` observed
 * in the wild coming from Apple IE.
 */
export function useHistoryState<T>() {
	const { state }: Location<Partial<T>> = useLocation();
	const originalNavigate = useNavigate();

	const pushState = useCallback(
		(newState: T) =>
			originalNavigate(location.pathname, {
				state: { ...(history.state?.usr || {}), ...newState },
			}),
		[originalNavigate],
	);

	const replaceState = useCallback(
		(newState: T) =>
			originalNavigate(location.pathname, {
				state: { ...(history.state?.usr || {}), ...newState },
				replace: true,
			}),
		[originalNavigate],
	);

	const navigateTo: HistoryNavigateToFunction<T> = useCallback(
		(to, options) =>
			originalNavigate(to, {
				...options,
				...(options?.state ?
					{ state: { ...(history.state?.usr || {}), ...options.state } }
				:	{ state: history.state?.usr || {} }),
			}),
		[originalNavigate],
	);

	const navigateBack = useCallback(
		(delta: number = -1) => originalNavigate(delta),
		[originalNavigate],
	);

	const pushStateOrNavigateBack = useCallback(
		(push: boolean, newState: T) =>
			push ? pushState(newState) : navigateBack(),
		[pushState, navigateBack],
	);

	return {
		state: state || {},
		pushState,
		replaceState,
		navigateTo,
		navigateBack,
		pushStateOrNavigateBack,
		Link: HistoryStateLink<T>,
	};
}

export interface HistoryStateUserAction {
	userAction: boolean;
}

// Was extracted from the main file for React Refresh (see ESLint `react-refresh/only-export-components`)

// Note: see the Detrak project for a more recent version of HistoryState,
// which merges the new state with the current one to make it usable by multiple components
// simultaneously without conflicts.

import { useCallback } from "react";
import {
	Location,
	NavigateOptions,
	To,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { HistoryStateLink } from "./useHistoryState";

interface HistoryNavigateOptions<T> extends NavigateOptions {
	state?: T;
}

// Couldn't find a way to extend React Router's NavigateFunction, replacing the type of `options`
interface HistoryNavigateFunction<T> {
	(to: To, options?: HistoryNavigateOptions<T>): void;
	(delta: number): void;
}

export interface HistoryStateUserAction {
	userAction: boolean;
}

export function useHistoryState<T>() {
	const { state, pathname }: Location<Partial<T>> = useLocation();
	const originalNavigate = useNavigate();

	const pushState = useCallback(
		(newState: T) => originalNavigate(pathname, { state: newState }),
		[originalNavigate, pathname],
	);

	const replaceState = useCallback(
		(newState: T) =>
			originalNavigate(pathname, { state: newState, replace: true }),
		[originalNavigate, pathname],
	);

	const navigate: HistoryNavigateFunction<T> = originalNavigate;

	const pushStateOrNavigateBack = (push: boolean, newState: T) =>
		push ? pushState(newState) : navigate(-1);

	return {
		state: state || {},
		pushState,
		replaceState,
		navigate,
		pushStateOrNavigateBack,
		Link: HistoryStateLink<T>,
	};
}

import { useCallback } from "react";
import {
	Location,
	NavigateOptions,
	To,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { HistoryStateLink } from "./useHistoryState.const";

export interface HistoryStateUserAction {
	userAction: boolean;
}

interface HistoryNavigateOptions<T> extends NavigateOptions {
	state?: T;
}

// Couldn't find a way to extend React Router's NavigateFunction, replacing the type of `options`
interface HistoryNavigateFunction<T> {
	(to: To, options?: HistoryNavigateOptions<T>): void;
	(delta: number): void;
}

export function useHistoryState<T>() {
	const { state, pathname }: Location<Partial<T>> = useLocation();
	const originalNavigate = useNavigate();

	const pushState = useCallback(
		(newState: T) => originalNavigate(pathname, { state: newState }),
		[originalNavigate, pathname],
	);

	const navigate: HistoryNavigateFunction<T> = originalNavigate;

	const pushStateOrNavigateBack = (push: boolean, newState: T) =>
		push ? pushState(newState) : navigate(-1);

	return {
		state: state || {},
		pushState,
		navigate,
		pushStateOrNavigateBack,
		Link: HistoryStateLink<T>,
	};
}

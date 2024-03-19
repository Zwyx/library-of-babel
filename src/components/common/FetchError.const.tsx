// Was extracted from the main file because of the ESLint warning `react-refresh/only-export-components`

const fetchErrorTypes = ["network-error", "server-error", "not-found"] as const;
export type FetchErrorType = (typeof fetchErrorTypes)[number];
export const isFetchErrorType = (value: unknown): value is FetchErrorType =>
	typeof value === "string" &&
	fetchErrorTypes.includes(value as FetchErrorType);

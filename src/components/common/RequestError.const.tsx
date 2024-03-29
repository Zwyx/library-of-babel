// Was extracted from the main file to allow React Refresh to work
// (see ESLint `react-refresh/only-export-components`)

const requestErrorTypes = [
	"network-error",
	"server-error",
	"not-found",
] as const;
export type RequestErrorType = (typeof requestErrorTypes)[number];
export const isRequestErrorType = (value: unknown): value is RequestErrorType =>
	typeof value === "string" &&
	requestErrorTypes.includes(value as RequestErrorType);

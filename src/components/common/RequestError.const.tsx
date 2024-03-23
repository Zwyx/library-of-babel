// Was extracted from the main file because of the ESLint warning `react-refresh/only-export-components`

const requestErrorTypes = [
	"network-error",
	"server-error",
	"not-found",
] as const;
export type RequestErrorType = (typeof requestErrorTypes)[number];
export const isRequestErrorType = (value: unknown): value is RequestErrorType =>
	typeof value === "string" &&
	requestErrorTypes.includes(value as RequestErrorType);

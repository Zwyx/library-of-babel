import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// https://stackoverflow.com/questions/60437172/typescript-deep-replace-multiple-types
type Replacement<M extends [unknown, unknown], T> = M extends unknown
	? [T] extends [M[0]]
		? M[1]
		: never
	: never;
export type DeepReplace<T, M extends [unknown, unknown]> = {
	[P in keyof T]: T[P] extends M[0]
		? Replacement<M, T[P]>
		: T[P] extends object
		? DeepReplace<T[P], M>
		: T[P];
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

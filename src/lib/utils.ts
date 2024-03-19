import { clsx, type ClassValue } from "clsx";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

const LOG_ACTIVE = false;

export const lg = (...args: unknown[]) => LOG_ACTIVE && console.info(...args);

// https://stackoverflow.com/questions/60437172/typescript-deep-replace-multiple-types
type Replacement<M extends [unknown, unknown], T> =
	M extends unknown ?
		[T] extends [M[0]] ?
			M[1]
		:	never
	:	never;
export type DeepReplace<T, M extends [unknown, unknown]> = {
	[P in keyof T]: T[P] extends M[0] ? Replacement<M, T[P]>
	: T[P] extends object ? DeepReplace<T[P], M>
	: T[P];
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function usePrevious<T>(newValue: T) {
	const previousRef = useRef<T>();

	useEffect(() => {
		previousRef.current = newValue;
	});

	return previousRef.current;
}

export const isElementInViewport = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect();

	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= document.documentElement.clientHeight &&
		rect.right <= document.documentElement.clientWidth
	);
};

export const BINARY_PREFIXES = [
	"bytes",
	"KiB",
	"MiB",
	"GiB",
	"TiB",
	"PiB",
	"EiB",
	"ZiB",
	"YiB",
];

export const DECIMAL_PREFIXES = [
	"bytes",
	"kB",
	"MB",
	"GB",
	"TB",
	"PB",
	"EB",
	"ZB",
	"YB",
];

export const readableFileSize = (
	size: number,
	prefix: "binary" | "decimal" = "binary",
	language?: string,
): string => {
	const threshold = prefix === "binary" ? 1024 : 1000;
	const prefixes = prefix === "binary" ? BINARY_PREFIXES : DECIMAL_PREFIXES;

	let i = 0;

	while (Math.abs(size) >= threshold && i < prefixes.length) {
		size /= threshold;
		++i;
	}

	const finalSize = i === 0 ? size : parseFloat(size.toFixed(1));

	return (
		(language ? new Intl.NumberFormat(language).format(finalSize) : finalSize) +
		" " + // Non-breaking space
		prefixes[i]
	);
};

export const copyToClipboard = (content: string | Blob) =>
	new Promise((resolve) =>
		(typeof content === "string" ?
			navigator.clipboard.writeText(content)
		:	navigator.clipboard.write([new ClipboardItem({ "image/png": content })])
		)
			.then(resolve)
			.catch(alert),
	);

/**
 * If `content` is of type `Blob` (`object`), the file will be saved as a `.png`,
 * otherwise, it will be saved as a `.txt`
 */
export const saveToFile = (content: string | Blob, filenameSuffix?: string) => {
	const now = new Date();
	const fullYear = now.getFullYear();
	const month = `0${(now.getMonth() + 1).toString()}`.slice(-2);
	const day = `0${now.getDate().toString()}`.slice(-2);
	const hours = `0${now.getHours().toString()}`.slice(-2);
	const minutes = `0${now.getMinutes().toString()}`.slice(-2);
	const seconds = `0${now.getSeconds().toString()}`.slice(-2);
	const date = `${fullYear}-${month}-${day}-${hours}-${minutes}-${seconds}`;

	const extension = typeof content === "object" ? ".png" : ".txt";
	const filename = `Library of Babel ${date}${filenameSuffix ? ` ${filenameSuffix}` : ""}${extension}`;

	const url = URL.createObjectURL(
		typeof content === "string" ?
			new File([content], filename, { type: "text/plain" })
		:	content,
	);

	const anchor = document.createElement("a");

	anchor.setAttribute("href", url);
	anchor.setAttribute("download", filename);
	anchor.click();
};

export const getUrl = (text: string) =>
	"https://".concat(
		text
			.split("9")
			.map((code) => String.fromCharCode(parseInt(code, 9)))
			.reverse()
			.join(""),
	);

export const sleep = (seconds: number) =>
	new Promise((r) => setTimeout(r, seconds * 1000));

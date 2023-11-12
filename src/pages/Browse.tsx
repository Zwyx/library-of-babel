import { Book, Page } from "@/components/BookPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const Browse = () => {
	const [value, setValue] = useState<string>("");
	const [book, setBook] = useState<Book>([]);

	const toBase81 = (x: bigint): string => {
		const time = Date.now();

		const alphabet =
			"!#$%&*+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz~";

		// 	const base = 81n;

		let result = "";

		// let q = x;
		// let r;

		// while (q >= base) {
		// 	r = q % base;
		// 	result = alphabet[Number(r)] + result;
		// 	q = q / base;
		// }

		// Successive divisions method is way slower than the following!

		const str = x.toString(9);

		for (let i = str.length - 2; i > 0; i -= 2) {
			result = alphabet[parseInt(str.slice(i, i + 2), 9)] + result;
		}

		console.log(Date.now() - time);

		return result;
	};

	const convert = () => {
		const time = Date.now();

		// setText(
		// 	BigInt(value)
		// 		.toString(29)
		// 		.replace(/s/g, ".")
		// 		.replace(/r/g, ",")
		// 		.replace(/q/g, "z")
		// 		.replace(/p/g, "y")
		// 		.replace(/o/g, "x")
		// 		.replace(/n/g, "w")
		// 		.replace(/m/g, "v")
		// 		.replace(/l/g, "u")
		// 		.replace(/k/g, "t")
		// 		.replace(/j/g, "s")
		// 		.replace(/i/g, "r")
		// 		.replace(/h/g, "q")
		// 		.replace(/g/g, "p")
		// 		.replace(/f/g, "o")
		// 		.replace(/e/g, "n")
		// 		.replace(/d/g, "m")
		// 		.replace(/c/g, "l")
		// 		.replace(/b/g, "k")
		// 		.replace(/a/g, "j")
		// 		.replace(/9/g, "i")
		// 		.replace(/8/g, "h")
		// 		.replace(/7/g, "g")
		// 		.replace(/6/g, "f")
		// 		.replace(/5/g, "e")
		// 		.replace(/4/g, "d")
		// 		.replace(/3/g, "c")
		// 		.replace(/2/g, "b")
		// 		.replace(/1/g, "a")
		// 		.replace(/0/g, " "),
		// );

		// The two methods are equivalent performance wise
		// ↑ was maybe true with `replaceAll` (in NextJS), but here, the following method seems to be 100ms faster

		const orig = BigInt(value).toString(29).padStart(1312000, "0");

		const from = "0123456789abcdefghijklmnopqrs";
		const to = " abcdefghijklmnopqrstuvwxyz,.";

		const result: Book = [];
		let page: Page = { key: crypto.randomUUID(), lines: [] };
		let chars = "";

		for (let i = 0; i < orig.length; i++) {
			chars += to[from.indexOf(orig.charAt(i))];

			if ((i + 1) % 80 === 0) {
				page.lines.push({ key: crypto.randomUUID(), chars });
				chars = "";

				if ((i + 1) % 3200 === 0) {
					result.push(page);
					page = { key: crypto.randomUUID(), lines: [] };
				}
			}
		}

		setBook(result);

		console.log(Date.now() - time);
	};

	return (
		<>
			<div className="mt-8">
				Each book has 410 pages. Each page has 3200 characters. Each characters
				is one of 29 possibilities: the space, the 26 letters from{" "}
				<strong>a</strong> to <strong>z</strong>, as well as the comma and the
				period.
			</div>

			<div className="mt-8">
				Note that even if a book is longer than 410 pages, it is still entirely
				present in the Library of Babel, it is simply cut into multiple volumes.
			</div>

			<div className="mt-8">
				There are about 1.5×10<sup>1918666</sup> books.
			</div>

			<div className="mt-8">All this is visible on this website.</div>

			<Textarea value={value} onChange={(e) => setValue(e.target.value)} />

			<Button onClick={convert}>Convert</Button>

			<div className="whitespace-pre-wrap break-words">
				{/* {BigInt(value).toString(29)} */}
			</div>

			{/* <div className="whitespace-pre-wrap break-words">{text}</div> */}

			<div className="whitespace-pre-wrap break-words">
				{/* {(29n ** (410n * 3200n) % 65n).toString()} */}
			</div>

			<div className="whitespace-pre-wrap break-words">
				{/* {toBase81(BigInt(value))} */}
			</div>

			<div className="max-w-[85ch] font-mono">
				{book.map(({ key, lines }, i) => (
					<Page key={key} number={i + 1} lines={lines} />
				))}
			</div>
		</>
	);
};

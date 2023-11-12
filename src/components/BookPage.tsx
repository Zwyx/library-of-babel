export type Line = {
	key: string;
	chars: string;
};

export type Page = {
	key: string;
	number: number;
	lines: Line[];
};

export type Book = Page[];

export const Page = ({ number, lines }: { number: number; lines: Line[] }) => (
	<div className="mt-4 flex flex-col items-center">
		<span>Page {number}/410</span>

		<div className="max-w-[85ch] rounded border font-mono">
			{lines.map(({ chars, key }) => (
				<div key={key}>{chars}</div>
			))}
		</div>
	</div>
);

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Library = () => {
	return (
		<div className="flex flex-col items-center gap-8 text-center">
			<div>Each book has 410 pages.</div>
			<div>Each page, 40 lines.</div>
			<div>Each line, 80 characters.</div>
			<div>Each characters can be a space, a letter, a comma, or a period.</div>

			<div>
				We estimate that there are 10<sup>80</sup> atoms in the observable
				Universe. {"That's"} a number with <strong>81 digits</strong>.
			</div>

			<div>
				There are 29
				<sup>1,312,000</sup> books in the Library of Babel, about 1.5×10
				<sup>1918666</sup>, a number with <strong>1,918,667 digits</strong>.
			</div>

			<div>All these books are accessible here.</div>

			<div>To find a book, try to search for text:</div>

			<Button asChild>
				<Link to="/search">Search for text</Link>
			</Button>
		</div>
	);
};

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Intro = () => {
	return (
		<div className="flex flex-col items-center gap-6 text-center">
			<div className="mt-4">Each book contains 410 pages.</div>
			<div>Each page, 40 lines.</div>
			<div>Each line, 80 characters.</div>
			<div>Each characters can be a space, a letter, a comma, or a period.</div>

			<div>
				The number of atoms in the observable Universe is estimated to be a
				number with <strong>80 digits</strong>.
			</div>

			<div>
				There are 29
				<sup>1,312,000</sup> books in the Library of Babel — a number with{" "}
				<strong>1,918,667 digits</strong>.
			</div>

			<div>They are all available here.</div>

			<div>To find one, start by searching for text:</div>

			<Button asChild>
				<Link to="/search">Search for text</Link>
			</Button>
		</div>
	);
};

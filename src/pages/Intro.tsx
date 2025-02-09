import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Intro = () => {
	return (
		<div className="flex flex-col items-center gap-6 text-center">
			<p className="mt-4">Each book contains 410 pages.</p>

			<p>Each page, 40 lines.</p>

			<p>Each line, 80 characters.</p>

			<p>Each character can be a space, a letter, a comma, or a period.</p>

			<p>
				The number of atoms in the observable Universe is estimated to be a
				number with <strong>80 digits</strong>.
			</p>

			<p>
				There are 29
				<sup>1,312,000</sup> books in the Library of Babel — a number with{" "}
				<strong>1,918,667 digits</strong>.
			</p>

			<p>They are all available here.</p>

			<p>To find one, start by searching for text:</p>

			<Button variant="ghostLink" asChild>
				<Link className="font-semibold" to="/search">
					Search for text
				</Link>
			</Button>
		</div>
	);
};

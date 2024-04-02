import { Button } from "@/components/ui/button";
import { OutletContext } from "@/lib/common";
import { cn } from "@/lib/utils";
import { Link, useOutletContext } from "react-router-dom";

export const Home = () => {
	const { lastLibraryModeCheckDone } = useOutletContext<OutletContext>();

	return (
		<div
			className={cn(
				"flex flex-col items-center gap-8 text-center opacity-0 transition-opacity duration-1000",
				lastLibraryModeCheckDone && "opacity-100",
			)}
		>
			<h1 className="mt-4 text-xl font-semibold">Welcome, visitor</h1>

			<p>
				The Library of Babel contains <em>all the books</em>.
			</p>

			<p>
				Every book{" "}
				<em>
					that has <strong>ever been</strong> written
				</em>
				.
			</p>

			<p>
				Every book{" "}
				<em>
					that will <strong>ever be</strong> written
				</em>
				.
			</p>

			<p>
				And the vast majority of books{" "}
				<em>
					that will <strong>never be</strong> written
				</em>
				.
			</p>

			<Button variant="ghostLink" asChild>
				<Link className="font-semibold" to="/intro">
					Enter the library
				</Link>
			</Button>
		</div>
	);
};

import { Link } from "react-router-dom";

export const Home = () => {
	return (
		<div className="flex flex-col items-center gap-8">
			<h1 className="text-xl font-semibold">Welcome, visitor.</h1>

			<div>
				The Library of Babel contains <em>all the books</em>.
			</div>

			<div>
				Every books{" "}
				<em>
					that have <strong>ever been</strong> written
				</em>
				.
			</div>

			<div>
				Every books{" "}
				<em>
					that will <strong>ever be</strong> written
				</em>
				.
			</div>

			<div>
				And the vast majority of every books{" "}
				<em>
					that will <strong>never be</strong> written
				</em>
				.
			</div>

			<div>
				Your complete biography, the solutions to the greatest mysteries in
				Mankind's history, the precise description of our future.
			</div>

			<Link to="/library">Enter the library</Link>
		</div>
	);
};

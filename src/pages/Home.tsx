import { Link } from "react-router-dom";

export const Home = () => {
	return (
		<>
			<h1 className="mt-8">Welcome, visitor.</h1>

			<div className="mt-8">The Library of Babel contains all the books.</div>

			<div className="mt-8">All the books that have ever been written.</div>

			<div className="mt-8">All the books that will ever be written.</div>

			<div className="mt-8">
				And the vast majority of all the books that will never exist.
			</div>

			<div className="mt-8">
				Your complete biography. The precise description of the future of the
				human race.
			</div>

			<div className="mt-8">Every possible book is in the library.</div>

			<Link className="mt-8" to="/browse">
				Enter
			</Link>
		</>
	);
};

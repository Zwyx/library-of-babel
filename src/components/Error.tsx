import { Button } from "./ui/button";

export const Error = () => {
	return (
		<div className="mt-8 text-center">
			<h1 className="font-semibold">Oops, something went wrong.</h1>

			<p className="mt-4">
				An unexpected error occurred, please reload the page. Sorry for the
				inconvenience.
			</p>

			<Button className="mt-6" onClick={() => location.reload()}>
				Reload
			</Button>
		</div>
	);
};

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const Navigation = () => {
	const { t } = useTranslation(["navigation"]);

	return (
		<nav className="hidden md:flex">
			<Link to="/">Home</Link>
			<Link to="/">Browse</Link>
			<Link to="/">Search</Link>
		</nav>
	);
};

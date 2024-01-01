import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const TABS = [
	{ path: "/browse", label: "Browse" },
	{ path: "/search", label: "Search" },
	{ path: "/random", label: "Random" },
];

export const TabBar = ({ tab }: { tab: string }) => {
	if (!TABS.some(({ path }) => path === tab)) {
		return null;
	}

	return (
		<Tabs value={tab}>
			<TabsList>
				{TABS.map(({ path, label }) => (
					<TabsTrigger key={path} value={path} asChild>
						<Link className="text-primary" to={path}>
							{label}
						</Link>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
};

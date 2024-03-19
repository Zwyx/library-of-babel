import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PB_ID_REGEX } from "@/lib/pb";
import { Link } from "react-router-dom";

const tabs = [
	{ path: "browse", label: "Browse" },
	{ path: "search", label: "Search" },
	{ path: "random", label: "Random" },
] as const;
const tabPaths = tabs.map(({ path }) => path);
type TabPath = (typeof tabPaths)[number];
const isTabPath = (value: unknown): value is TabPath =>
	typeof value === "string" && tabPaths.includes(value as TabPath);

export const TabBar = ({ tab }: { tab: string }) => {
	const currentTab: TabPath | null =
		isTabPath(tab) ? tab
		: PB_ID_REGEX.test(tab) ? "browse"
		: null;

	if (!currentTab) {
		return;
	}

	return (
		<Tabs value={currentTab}>
			<TabsList>
				{tabs.map(({ path, label }) => (
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

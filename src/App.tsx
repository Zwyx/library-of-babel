import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { TabBar } from "./components/TabBar";
import { WorkersAlert } from "./components/WorkersAlert";
import { AboutDialog } from "./pages/AboutDialog";

export const App = () => {
	const { pathname } = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	return (
		<div className="flex h-[100svh] flex-col">
			<SiteHeader />

			<div className="flex flex-col items-center gap-4 overflow-auto px-2 py-4">
				{pathname !== "/" && <WorkersAlert />}

				<TabBar tab={pathname} />

				<Outlet />

				<AboutDialog
					open={typeof searchParams.get("about") === "string"}
					onOpenChange={() => {
						searchParams.delete("about");
						setSearchParams(searchParams);
					}}
				/>
			</div>
		</div>
	);
};

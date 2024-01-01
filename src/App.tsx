import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { TabBar } from "./components/TabBar";

export const App = () => {
	const { pathname } = useLocation();

	return (
		<div className="flex h-[100svh] flex-col">
			<SiteHeader />
			<div className="flex flex-col items-center gap-4 overflow-auto px-2 py-4">
				<TabBar tab={pathname} />
				<Outlet />
			</div>
		</div>
	);
};

import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { TabBar } from "./components/TabBar";
import { WorkersAlert } from "./components/WorkersAlert";
import { AboutDialog } from "./components/library/about/AboutDialog";
import { ABOUT } from "./components/library/about/AboutDialog.const";

export const App = () => {
	const { pathname } = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	return (
		// We used to have `flex h-[100svh] flex-col` in this root div, but it had
		// an impact on performance: scrolling was feeling laggy when a book page was display
		// (which contain up to 3200 CSS gradients), and when using Chrome Dev Tools's
		// Rendering Paint flashing, we noticed that the book page is rerendered
		// when scrolling, which isn't the case without this flexbox
		<div>
			<SiteHeader />

			<div className="flex flex-col items-center gap-4 px-2 py-4">
				{pathname !== "/" && <WorkersAlert />}

				<TabBar tab={pathname.split("/")[1]} />

				<Outlet />

				<AboutDialog
					open={typeof searchParams.get(ABOUT) === "string"}
					onOpenChange={() => {
						searchParams.delete(ABOUT);
						setSearchParams(searchParams);
					}}
				/>
			</div>
		</div>
	);
};

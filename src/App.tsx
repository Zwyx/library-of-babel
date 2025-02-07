import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { TabBar } from "./components/TabBar";
import { WorkersAlert } from "./components/WorkersAlert";
import { AboutDialog } from "./components/library/about/AboutDialog";
import { ABOUT } from "./components/library/about/AboutDialog.const";
import { OutletContext, isLibraryMode } from "./lib/common";
import { LAST_LIBRARY_MODE_KEY } from "./lib/local-storage-keys";
import {
	HistoryStateUserAction,
	useHistoryState,
} from "./lib/useHistoryState.const";

export const App = () => {
	const { pathname, search } = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { state, navigate } = useHistoryState<HistoryStateUserAction>();

	const [lastLibraryModeCheckDone, setLastLibraryModeCheckDone] =
		useState<boolean>(false);

	const firstRender = useRef<boolean>(true);

	useEffect(() => {
		if (!firstRender.current) {
			return;
		}

		firstRender.current = false;

		if (location.pathname === "/" && !search) {
			const lastLibraryMode = localStorage.getItem(LAST_LIBRARY_MODE_KEY);

			if (isLibraryMode(lastLibraryMode)) {
				navigate(lastLibraryMode, { replace: true });
			}
		}

		setLastLibraryModeCheckDone(true);
	}, [pathname, search, navigate]);

	const outletContext: OutletContext = { lastLibraryModeCheckDone };

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

				<Outlet context={outletContext} />

				<AboutDialog
					open={typeof searchParams.get(ABOUT) === "string"}
					onOpenChange={() => {
						if (state.userAction) {
							navigate(-1);
						} else {
							searchParams.delete(ABOUT);
							setSearchParams(searchParams, { replace: true });
						}
					}}
				/>
			</div>
		</div>
	);
};

import { ReactNode, createContext, useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

export const PwaContext = createContext<
	| {
			update: (() => Promise<void>) | undefined;
			needsRefresh: boolean;
			refresh: (() => Promise<void>) | undefined;
	  }
	| undefined
>(undefined);

export const PwaContextProvider = ({ children }: { children: ReactNode }) => {
	const [update, setUpdate] = useState<() => Promise<void>>();
	const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
	const [refresh, setRefresh] = useState<() => Promise<void>>();

	useEffect(() => {
		setRefresh(() =>
			registerSW({
				onRegisteredSW: (_, serviceWorkerRegistration) => {
					if (serviceWorkerRegistration) {
						setUpdate(() => () => serviceWorkerRegistration.update());

						setInterval(
							() => serviceWorkerRegistration.update(),
							60 * 60 * 1000,
						);
					}
				},
				onNeedRefresh: () => setNeedsRefresh(true),
			}),
		);
	}, []);

	return (
		<PwaContext.Provider value={{ update, needsRefresh, refresh }}>
			{children}
		</PwaContext.Provider>
	);
};

import { ReactNode, createContext, useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

export const PwaContext = createContext<
	| {
			needsRefresh: boolean;
			refresh: (() => void) | undefined;
	  }
	| undefined
>(undefined);

export const PwaContextProvider = ({ children }: { children: ReactNode }) => {
	const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
	const [refresh, setRefresh] = useState<() => void>();

	useEffect(() => {
		setRefresh(() =>
			registerSW({
				onRegisteredSW: (_, r) =>
					r && setInterval(() => r.update(), 60 * 60 * 1000),
				onNeedRefresh: () => setNeedsRefresh(true),
			}),
		);
	}, []);

	return (
		<PwaContext.Provider value={{ needsRefresh, refresh }}>
			{children}
		</PwaContext.Provider>
	);
};

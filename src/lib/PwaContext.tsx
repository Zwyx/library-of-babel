import { PropsWithChildren, useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import { PwaContext } from "./PwaContext.const";

export const PwaContextProvider = ({ children }: PropsWithChildren) => {
	const [update, setUpdate] = useState<() => Promise<void>>();
	const [refreshNeeded, setRefreshNeeded] = useState<boolean>(false);
	const [refreshNeededAcknowledged, setRefreshNeededAcknowledged] =
		useState<boolean>(false);
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
				onNeedRefresh: () => {
					setRefreshNeeded(true);
					setRefreshNeededAcknowledged(false);
				},
			}),
		);
	}, []);

	return (
		<PwaContext.Provider
			value={{
				update,
				refreshNeeded,
				refreshNeededAcknowledged,
				setRefreshNeededAcknowledged,
				refresh,
			}}
		>
			{children}
		</PwaContext.Provider>
	);
};

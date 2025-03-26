import {
	PropsWithChildren,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { registerSW } from "virtual:pwa-register";
import { PwaContext } from "./PwaContext.const";

const APP_VERSION = import.meta.env.VITE_APP_VERSION;

export const PwaContextProvider = ({ children }: PropsWithChildren) => {
	const update = useRef<() => Promise<void>>();

	const [newMajorVersionAvailable, setNewMajorVersionAvailable] =
		useState(false);
	const [newMajorVersionAcknowledged, setNewMajorVersionAcknowledged] =
		useState(false);
	const [refreshPending, setRefreshPending] = useState(false);
	const [refresh, setRefresh] = useState<() => Promise<void>>();

	const checkForNewVersion = useCallback(
		() =>
			fetch(`https://${location.host}/.well-known/version`)
				.then((res) => res.text())
				.then((rawLatestVersion) => {
					const latestVersion = rawLatestVersion.replace(/\n/, "");

					if (APP_VERSION !== latestVersion) {
						update.current?.();

						const majorAppVersion = APP_VERSION.split(".")[0];
						const majorLatestVersion = latestVersion.split(".")[0];

						if (majorAppVersion !== majorLatestVersion) {
							setNewMajorVersionAvailable(true);
						}
					}
				})
				.catch(() => {
					update.current?.();
				}),
		[],
	);

	useEffect(() => {
		setRefresh(() =>
			registerSW({
				onRegisteredSW: (_, serviceWorkerRegistration) => {
					if (serviceWorkerRegistration) {
						// Wrapping the call to `update` in a function is necessary to prevent
						// an "illegal invocation" error
						update.current = () => serviceWorkerRegistration.update();
					}
				},
				onNeedRefresh: () => setRefreshPending(true),
			}),
		);
	}, []);

	useEffect(() => {
		checkForNewVersion();
		setInterval(checkForNewVersion, 24 * 60 * 60 * 1000);
	}, [checkForNewVersion]);

	return (
		<PwaContext.Provider
			value={{
				version: APP_VERSION,
				refreshReady: refreshPending && !!refresh,
				newMajorVersionReady:
					newMajorVersionAvailable && refreshPending && !!refresh,
				newMajorVersionAcknowledged,
				setNewMajorVersionAcknowledged,
				checkForNewVersion,
				refresh,
			}}
		>
			{children}
		</PwaContext.Provider>
	);
};

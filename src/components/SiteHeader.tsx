import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HeaderMenu } from "./HeaderMenu";
import { PwaRefresher } from "./PwaRefresher";
import { ThemeSelector } from "./ThemeSelector";

export const SiteHeader = () => {
	const { t } = useTranslation(["siteHeader"]);

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm">
			<div className="container flex h-14 items-center justify-between gap-2 p-2">
				<div className="flex flex-1 items-center justify-start">
					<HeaderMenu />
				</div>

				<div className="flex flex-[10] justify-center">
					<Link
						to="/"
						className="text-center font-bold text-primary dark:text-primary"
					>
						{t("libraryOfBabel")}
					</Link>
				</div>

				<div className="flex flex-1 items-center justify-end gap-1">
					<PwaRefresher />
					<ThemeSelector />
					{/* TODO: activate once translations ready <LanguageSelector /> */}
				</div>
			</div>
		</header>
	);
};

import { useTranslation } from "react-i18next";
import { HeaderMenu } from "./HeaderMenu";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeSelector } from "./ThemeSelector";

export const SiteHeader = () => {
	const { t } = useTranslation(["siteHeader"]);

	return (
		<header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur">
			<div className="container flex h-14 items-center gap-4 p-6">
				<HeaderMenu />

				<span className="flex-[10] text-center font-bold">
					{t("libraryOfBabel")}
				</span>

				<nav className="flex flex-1 items-center justify-end gap-1">
					<ThemeSelector />
					<LanguageSelector />
				</nav>
			</div>
		</header>
	);
};

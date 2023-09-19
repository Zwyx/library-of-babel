import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { I18nLocaleCode } from "@/i18n/i18n";
import { LOCALE_KEY } from "@/lib/keys";
import { LucideLanguages } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LanguageSelector = () => {
	const { t, i18n } = useTranslation(["languageSelector"]);

	const changeLanguage = (localeCode: I18nLocaleCode) => {
		i18n.changeLanguage(localeCode);
		localStorage.setItem(LOCALE_KEY, localeCode);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="w-9 px-0">
					<LucideLanguages />
					<span className="sr-only">{t("chooseLanguage")}</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => changeLanguage("en")}>
					{"English"}
				</DropdownMenuItem>

				<DropdownMenuItem onClick={() => changeLanguage("fr")}>
					{"Français"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

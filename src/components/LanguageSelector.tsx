import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resources } from "@/i18n/i18n";
import { LOCALE_KEY } from "@/lib/local-storage-keys";
import { LucideLanguages } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LanguageSelector = () => {
	const { t, i18n } = useTranslation("languageSelector");

	const changeLanguage = (localeCode: string) => {
		i18n.changeLanguage(localeCode);
		localStorage.setItem(LOCALE_KEY, localeCode);
	};

	const languages: { [languageCode in keyof typeof resources]: string } = {
		en: "English",
		fr: "Français",
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<LucideLanguages />
					<span className="sr-only">{t("chooseLanguage")}</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{t("language")}</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuRadioGroup value={i18n.resolvedLanguage}>
					{Object.entries(languages).map(([languageCode, languageName]) => (
						<DropdownMenuRadioItem
							key={languageCode}
							value={languageCode}
							onClick={() => changeLanguage(languageCode)}
						>
							<span>{languageName}</span>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

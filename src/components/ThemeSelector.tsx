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
import { ThemeChoice, useThemeContext } from "@/lib/ThemeContext.const";
import { LucideMoon, LucideSunMedium } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ThemeSelector = () => {
	const { t } = useTranslation("themeSelector");

	const { themeChoice, updateThemeChoice } = useThemeContext();

	const themeChoices: { [themeChoice in ThemeChoice]: string } = {
		system: t("sameAsDevice"),
		light: t("light"),
		dark: t("dark"),
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<LucideSunMedium className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<LucideMoon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">{t("chooseTheme")}</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{t("theme")}</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuRadioGroup value={themeChoice}>
					{Object.entries(themeChoices).map(
						([themeChoiceId, themeChoiceName]) => (
							<DropdownMenuRadioItem
								key={themeChoiceId}
								value={themeChoiceId}
								onClick={() => updateThemeChoice(themeChoiceId as ThemeChoice)}
							>
								<span>{themeChoiceName}</span>
							</DropdownMenuRadioItem>
						),
					)}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

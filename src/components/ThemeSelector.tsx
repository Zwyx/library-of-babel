import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeContext } from "@/lib/ThemeContext.const";
import { LucideLaptop, LucideMoon, LucideSunMedium } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ThemeSelector = () => {
	const { t } = useTranslation(["themeSelector"]);
	const { updateThemeChoice } = useThemeContext();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="w-9 px-0">
					<LucideSunMedium className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<LucideMoon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">{t("chooseTheme")}</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => {
						updateThemeChoice("system");
					}}
				>
					<LucideLaptop className="mr-2 h-4 w-4" />
					<span>{t("sameAsDevice")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => {
						updateThemeChoice("light");
					}}
				>
					<LucideSunMedium className="mr-2 h-4 w-4" />
					<span>{t("light")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => {
						updateThemeChoice("dark");
					}}
				>
					<LucideMoon className="mr-2 h-4 w-4" />
					<span>{t("dark")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

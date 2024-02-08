import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LucideMenu } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "./common/ExternalLink";
import { AboutDialogLink } from "./library/about/AboutDialog";

export const HeaderMenu = () => {
	const { t } = useTranslation(["headerMenu"]);

	const [open, setOpen] = React.useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" className="px-2">
					<LucideMenu className="h-6 w-6" />
					<span className="sr-only">{t("openMenu")}</span>
				</Button>
			</SheetTrigger>

			<SheetContent
				side="left"
				className="flex h-full w-auto flex-col items-start gap-0 overflow-auto"
			>
				<div className="flex items-center gap-4">
					<img
						className="w-8"
						src="Babel-220x220-rounded.png"
						alt="Library of Babel logo"
					/>
					<span className="font-bold">{t("libraryOfBabel")}</span>
				</div>

				<div className="mt-6 flex flex-col gap-6">
					<div>
						<ExternalLink
							href="https://en.wikipedia.org/wiki/The_Library_of_Babel"
							showIcon
						>
							"The Library of Babel"
						</ExternalLink>{" "}
						is a short story by Argentine author and librarian Jorge Luis
						Borges, conceiving of a universe in the form of a vast library
						containing all possible 410-page books of a certain format and
						character set.{" "}
					</div>

					<div className="border-l-2 pl-2 italic">
						All — the detailed history of the future, the autobiographies of the
						archangels, the faithful catalog of the Library, thousands and
						thousands of false catalogs, the proof of the falsity of those false
						catalogs, a proof of the falsity of the true catalog, [...].
					</div>

					<div className="mt-4">
						This app is a digital recreation of this concept.
					</div>

					<div>
						It works by manipulating numbers to convert the identifier of a book
						to its content, which also allows to know the book's location in the
						library. <AboutDialogLink to="?about">Learn more</AboutDialogLink>
					</div>
				</div>

				<div className="flex-1" />

				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="link"
							size="sm"
							className="mt-2 h-fit p-0 text-right text-xs font-bold text-muted-foreground hover:no-underline"
						>
							{"Privacy policy"}
						</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>{"Privacy policy"}</DialogTitle>
						</DialogHeader>

						<div>
							{"No personal user data is collected by this website. "}
							<a
								href="https://sentry.io"
								target="_blank"
								rel="noreferrer nofollow"
								className="font-bold"
							>
								{"Sentry"}
							</a>
							{" is used for error reporting, and "}
							<a
								href="https://plausible.io"
								target="_blank"
								rel="noreferrer nofollow"
								className="font-bold"
							>
								{"Plausible"}
							</a>
							{
								" is used for analytics. These two services are both GDPR and CCPA compliant, they don't store any cookies and respect user privacy."
							}
						</div>
					</DialogContent>
				</Dialog>

				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="link"
							size="sm"
							className="mt-2 h-fit p-0 text-right text-xs font-bold text-muted-foreground hover:no-underline"
						>
							{"Terms and conditions"}
						</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>{"Terms and conditions"}</DialogTitle>
						</DialogHeader>

						<div>
							{
								"The software is provided “as is”, without warranty of any kind. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software."
							}
						</div>
					</DialogContent>
				</Dialog>

				<div className="mt-4 w-full border" />

				<div className="mt-4 w-full text-xs text-muted-foreground">
					{"© "}
					<a
						href="https://zwyx.dev"
						target="_blank"
						rel="noreferrer"
						className="font-bold"
					>
						{"Zwyx.dev"}
					</a>
				</div>

				<div className="mt-1 w-full text-xs text-muted-foreground">
					{"Source code available at "}
					<a
						href="https://github.com/zwyx/library-of-babel"
						target="_blank"
						rel="noreferrer"
						className="font-bold"
					>
						{"github.com/zwyx/library-of-babel"}
					</a>
				</div>

				<div className="mt-2 w-full text-right text-xs text-muted-foreground">
					{t("version")}{" "}
					<span className="font-bold">{import.meta.env.VITE_APP_VERSION}</span>
				</div>
			</SheetContent>
		</Sheet>
	);
};

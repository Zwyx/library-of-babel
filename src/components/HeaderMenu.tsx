import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { usePwaContext } from "@/lib/PwaContext.const";
import { useHistoryState } from "@/lib/useHistoryState.const";
import { LucideMenu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertFrame } from "./common/AlertFrame";
import { ButtonStatus } from "./common/ButtonStatus";
import { Code } from "./common/Code";
import { ExternalLink } from "./common/ExternalLink";
import { AboutDialogIntro } from "./library/about/AboutDialog";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const HeaderMenu = () => {
	const pwa = usePwaContext();
	const { t } = useTranslation("headerMenu");

	const { state, navigateBack, pushStateOrNavigateBack } = useHistoryState<{
		headerMenuOpen: boolean;
		termsOfUseDialogOpen?: boolean;
		privacyPolicyDialogOpen?: boolean;
	}>();

	const [checkForUpdatesLoading, setCheckForUpdatesLoading] = useState(false);
	const [newFeaturesReloading, setNewFeaturesReloading] = useState(false);
	const [updateReloading, setUpdateReloading] = useState(false);
	const [pwaInstallPrompt, setPwaInstallPrompt] =
		useState<BeforeInstallPromptEvent>();

	const touchStartX = useRef(0);
	const touchStartY = useRef(0);

	useEffect(() => {
		window.addEventListener("beforeinstallprompt", (e) => {
			// If we want to prevent the default install dialog
			// e.preventDefault();

			setPwaInstallPrompt(e as BeforeInstallPromptEvent);
		});
	}, []);

	const showNewFeaturesPing =
		pwa.newMajorVersionReady && !pwa.newMajorVersionAcknowledged;

	const triggerInstallPrompt = () =>
		pwaInstallPrompt?.prompt().finally(() => setPwaInstallPrompt(undefined));

	return (
		<Sheet
			open={!!state.headerMenuOpen}
			onOpenChange={(open) =>
				pushStateOrNavigateBack(open, { headerMenuOpen: true })
			}
		>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative"
					onClick={() => {
						if (showNewFeaturesPing) {
							pwa.setNewMajorVersionAcknowledged(true);
						}
					}}
				>
					<LucideMenu />
					<span className="sr-only">{t("openMenu")}</span>

					{showNewFeaturesPing && (
						<span className="absolute right-0 top-0 flex h-3 w-3">
							<span className="absolute h-full w-full animate-ping rounded-full bg-info opacity-75" />
							<span className="absolute left-[2px] top-[2px] h-2 w-2 rounded-full bg-info" />
						</span>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent
				side="left"
				className="flex w-auto flex-col items-start gap-0 overflow-auto"
				onTouchStart={(e) => {
					touchStartX.current = e.changedTouches[0].screenX;
					touchStartY.current = e.changedTouches[0].screenY;
				}}
				onTouchEnd={(e) => {
					const rem = getComputedStyle(document.documentElement).fontSize;

					if (
						e.changedTouches[0].screenX - touchStartX.current <
							-2 * parseFloat(rem) &&
						Math.abs(e.changedTouches[0].screenY - touchStartY.current) <
							2 * parseFloat(rem)
					) {
						navigateBack();
					}
				}}
				noDescription
			>
				<SheetHeader>
					<SheetTitle>
						<div className="mb-2 flex items-center gap-4">
							<img
								className="h-8 w-8"
								src="favicon-196.png"
								alt="Library of Babel logo"
							/>
							<span className="font-bold">{t("libraryOfBabel")}</span>
						</div>
					</SheetTitle>
				</SheetHeader>

				{pwa.newMajorVersionReady && (
					<AlertFrame
						title="New features available"
						description="Save your changes then reload the app to update."
					>
						<ButtonStatus
							size="sm"
							className="m-1"
							disabled={updateReloading}
							loading={newFeaturesReloading}
							onClick={() => {
								setNewFeaturesReloading(true);
								pwa.refresh?.();
							}}
						>
							Reload
						</ButtonStatus>
					</AlertFrame>
				)}

				<div className="mt-4 flex flex-col gap-3">
					<AboutDialogIntro showLearnMore />
				</div>

				{pwaInstallPrompt && (
					<AlertFrame
						className="mt-8"
						title="The Library of Babel is an installable web app."
						description="You can add it to your home screen."
					>
						<Button size="sm" className="m-1" onClick={triggerInstallPrompt}>
							Install The Library of Babel
						</Button>
					</AlertFrame>
				)}

				<div className="flex-1" />

				<div className="mt-6 flex w-full items-center justify-center gap-2">
					<Dialog
						open={!!state.termsOfUseDialogOpen}
						onOpenChange={(open) =>
							pushStateOrNavigateBack(open, {
								headerMenuOpen: true,
								termsOfUseDialogOpen: true,
							})
						}
					>
						<DialogTrigger asChild>
							<Button
								variant="link"
								size="sm"
								className="mt-0.5 h-fit p-0 text-xs font-bold text-muted-foreground hover:no-underline"
							>
								{"Terms of use"}
							</Button>
						</DialogTrigger>

						<DialogContent
							className="max-h-full max-w-3xl overflow-auto"
							onTouchEnd={(e) => e.stopPropagation()}
							noDescription
						>
							<DialogHeader>
								<DialogTitle>{"Terms of use"}</DialogTitle>
							</DialogHeader>

							<div className="flex flex-col gap-3">
								<p>
									{
										'These Terms of Use ("Terms") govern your use of this application hosted and provided by Zwyx.dev ("we", "us", or "our"), ("Application") and any services offered through the Application ("Services").'
									}
								</p>

								<p>
									{
										"We may change these Terms or modify any features of the Application or the Services at any time. Any such change or modification will be effective immediately upon posting on our Application. You accept these Terms by using the Application and/or the Services, and you accept any changes to the Terms by continuing to use the Application and/or the Services after we post any such changes."
									}
								</p>

								<p>
									{
										"If you do not agree to these Terms, please do not access or use the Application."
									}
								</p>

								<h3 className="mt-2 font-semibold">{"Limits on liability"}</h3>

								<p>
									{
										'The Application and Services are provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. We make no guarantees that they always will be safe, secure, or error-free, that they will function without disruptions, delays, or imperfections or content will be accurate, current and complete.'
									}
								</p>

								<h3 className="mt-2 font-semibold">{"Content standards"}</h3>

								<p>{"You must not submit content that is illegal."}</p>

								<p>
									{"Takedown requests can be sent to "}
									<Code>babel-takedown</Code>
									{" at <Code>zwyx.dev</Code>."}
								</p>

								<h3 className="mt-2 font-semibold">
									{"Links to third-party content"}
								</h3>

								<p>
									{
										"The Application or Services may contain links to third-party content, over which we have no control and for which we have no responsibility."
									}
								</p>
							</div>

							<DialogFooter className="mt-1">
								<DialogClose asChild>
									<Button variant="secondary">Close</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<span className="font-bold text-muted-foreground">·</span>

					<Dialog
						open={!!state.privacyPolicyDialogOpen}
						onOpenChange={(open) =>
							pushStateOrNavigateBack(open, {
								headerMenuOpen: true,
								privacyPolicyDialogOpen: true,
							})
						}
					>
						<DialogTrigger asChild>
							<Button
								variant="link"
								size="sm"
								className="mt-0.5 h-fit p-0 text-xs font-bold text-muted-foreground hover:no-underline"
							>
								{"Privacy policy"}
							</Button>
						</DialogTrigger>

						<DialogContent
							className="max-h-full max-w-3xl overflow-auto"
							onTouchEnd={(e) => e.stopPropagation()}
							noDescription
						>
							<DialogHeader>
								<DialogTitle>{"Privacy policy"}</DialogTitle>
							</DialogHeader>

							<div className="flex flex-col gap-3">
								<p>
									{
										'This Privacy Policy describes Zwyx.dev ("we", "us", or "our") practices for handling your information in connection with this application ("Application") and any services offered through the Application ("Services"). This Privacy Policy describes the personal information we process to support our Services.'
									}
								</p>

								<p>
									{
										"We may change this Privacy Policy at any time. Any such change will be effective immediately upon posting on our Application. You accept this Privacy Policy by using the Application and/or the Services, and you accept any changes to the Privacy Policy by continuing to use the Application and/or the Services after we post any such changes."
									}
								</p>

								<p>
									{
										"If you do not agree to these Privacy Policy, please do not access or use the Application."
									}
								</p>

								<h3 className="mt-2 font-semibold">
									{"What kinds of information is collected?"}
								</h3>

								<p>
									{
										"Depending on the type of device you use and how you interact with us, we may collect certain information automatically when you use our Services, such as:"
									}
								</p>

								<ul className="list-disc pl-8">
									<li>
										{
											"Device attributes, including information such as the operating system, hardware and software versions, browser type."
										}
									</li>

									<li>
										{
											"Network and connections information, such as your IP address."
										}
									</li>

									<li>
										{
											"Browsing information, such as the referrer URL identifying the address of the web page which linked you to our Application."
										}
									</li>

									<li>
										{
											"Application performance information, such as software errors if they occur."
										}
									</li>
								</ul>

								<p>
									{
										"Our Application and Services are hosted by hosting providers, such as Amazon, Google, Microsoft. These hosting providers may also collect the information described above."
									}
								</p>

								<h3 className="mt-2 font-semibold">
									{"How do we use this information?"}
								</h3>

								<p>{"We use the information described above for:"}</p>

								<ul className="list-disc pl-8">
									<li>
										{
											"analytics purposes, such as knowing the number of users, and which features are the most popular;"
										}
									</li>

									<li>
										{
											"performance and error reporting purposes, such as being alerted if an error occurs in our Application."
										}
									</li>
								</ul>
							</div>

							<DialogFooter className="mt-1">
								<DialogClose asChild>
									<Button variant="secondary">Close</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<div className="mt-2 w-full border-b" />

				<div className="mt-3 w-full text-xs text-muted-foreground">
					{"© "}
					<ExternalLink href="https://zwyx.dev" showIcon>
						{"Zwyx.dev"}
					</ExternalLink>
				</div>

				<div className="mt-1 w-full text-xs text-muted-foreground">
					{"Source code available at "}
					<ExternalLink
						href="https://github.com/zwyx/library-of-babel"
						showIcon
					>
						{"github.com/zwyx/library-of-babel"}
					</ExternalLink>
				</div>

				<div className="mt-3 flex w-full items-center justify-end gap-2 text-xs text-muted-foreground">
					<span>
						{t("version")} <span className="font-bold">{pwa.version}</span>
					</span>

					<span className="font-bold text-muted-foreground">·</span>

					<ButtonStatus
						variant="link"
						size="sm"
						className="h-fit max-w-48 text-wrap p-0 text-xs font-bold text-muted-foreground hover:no-underline"
						disabled={newFeaturesReloading}
						loading={checkForUpdatesLoading || updateReloading}
						onClick={() => {
							if (pwa.refreshReady) {
								setUpdateReloading(true);
								pwa.refresh?.();
							} else {
								setCheckForUpdatesLoading(true);
								pwa.checkForNewVersion();
								setTimeout(() => setCheckForUpdatesLoading(false), 2500);
							}
						}}
					>
						{pwa.refreshReady ?
							"Update available, finish your game and click here to update"
						:	"Check for updates"}
					</ButtonStatus>
				</div>
			</SheetContent>
		</Sheet>
	);
};

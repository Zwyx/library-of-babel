import { Code } from "@/components/common/Code";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PropsWithChildren, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AboutDialogId, isAboutDialogId } from "./AboutDialog.const";
import "./AboutDialog.css";

export const AboutDialogLink = ({
	className,
	to,
	onClick,
	children,
}: {
	className?: string;
	to: `?about#${AboutDialogId}`;
	onClick?: () => void;
} & PropsWithChildren) => {
	return (
		<Link className={className} to={to} onClick={onClick}>
			{children}
		</Link>
	);
};

export const AboutDialog = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const { hash } = useLocation();

	const hashContent = hash.slice(1);

	const highlightedId = isAboutDialogId(hashContent) ? hashContent : undefined;

	useEffect(() => {
		// Ensures the highlighted element is accessible by our code
		requestAnimationFrame(
			() =>
				highlightedId &&
				document.getElementById(highlightedId)?.scrollIntoView(),
		);
	}, [highlightedId]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-full max-w-5xl flex-col">
				<DialogHeader>
					<DialogTitle>About the Library of Babel</DialogTitle>
				</DialogHeader>

				<div className="overflow-auto">
					<Section id="tbd" title="tbd" highlightedId={highlightedId}>
						<div>
							(A written book that is longer than 410 pages exists in the
							library anyway: it is simply cut into multiple volumes.)
						</div>

						<div>
							{
								"It's works offline. Nothing is sent to any server. It's the only existing library of Babel like that."
							}
						</div>

						<div>
							What you enter, and the books you read, never leave your device.
						</div>
					</Section>

					<Section
						id="browsers-limitations"
						title="Browsers limitations"
						highlightedId={highlightedId}
					>
						<div>
							In order to work with entire books, we need to generate numbers of
							about 2 millions digits (in base 10). Google Chrome has a limit of
							about 300 millions digits — well above our needs. However, as of
							January 2024, Mozilla Firefox and Apple Safari have a limit of
							about 300 thousands digits, which is below our requirement. For
							this reason, in these browsers, it's not possible to work with
							more than the first 67-68 pages of a book.
						</div>

						<div>
							There are 410 pages in a book, 40 lines per pages, 80 characters
							per lines: <Code>410 × 40 × 80 = 1,312,000</Code> characters per
							book.
						</div>

						<div>
							There are 29 different characters, so total number of books in the
							library is <Code>29^1,312,000</Code>
						</div>

						<div>
							<Code>1,312,000</Code> digits in base <Code>29</Code> (there are
							29 different characters) requires{" "}
							<Code>1,312,000 × log(29) / log(2) = 6,373,672</Code> bits, or{" "}
							<Code>1,312,000 × log(29) / log(10) = 1,918,667</Code> digits in
							base <Code>10</Code>
						</div>

						<Code className="mt-2" display="block">
							We need 410*40*80*log(29)/log(10) — 1,918,667 — digits in base 10
							Chrome limit: 2^30 - 1 bits (1,073,741,823 bits), or 2^(2^30) - 1
							(323,228,497 digits in base 10) Firefox and Safari limit: 2^20 - 1
							bits (1,048,575 bits), or 2^(2^20) - 1 (315,653 digits in base 10)
							So can only do 65 pages: 65*40*80*log(29)/log(10) = 304,178 digits
							in base 10
							<>
								We need 410 x 40 x 80 x log(29) / log(256) = 796709 digits in
								base 256; // there are four values per pixels (RGBA), so our
								image needs to contain // 410 x 40 x 80 x log(29) / log(256) / 4
								= 199178 pixels; // 199178 = 574 x 347
							</>
						</Code>
					</Section>
				</div>

				<>Image is 574x347 = 199178 pixel</>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const Section = ({
	id,
	title,
	highlightedId,
	children,
}: {
	id: AboutDialogId;
	title: string;
	highlightedId?: string;
} & PropsWithChildren) => {
	return (
		<div
			className={cn(
				"mb-2 mt-3 rounded px-2 py-1",
				id === highlightedId && "bg-muted",
			)}
		>
			<h3 id={id} className="mb-2 flex w-full gap-2 font-semibold">
				<span>{title}</span>
				<AboutDialogLink
					className="opacity-0 hover:opacity-100 focus:opacity-80"
					to={`?about#${id}`}
				>
					&nbsp;&nbsp;#&nbsp;&nbsp;
				</AboutDialogLink>
			</h3>
			{children}
		</div>
	);
};

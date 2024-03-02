import { Code } from "@/components/common/Code";
import { ExternalLink } from "@/components/common/ExternalLink";
import { Math } from "@/components/common/Math";
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
	to: "?about" | `?about#${AboutDialogId}`;
	onClick?: () => void;
} & PropsWithChildren) => {
	return (
		<Link className={cn("font-semibold", className)} to={to} onClick={onClick}>
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
			<DialogContent className="flex max-h-full max-w-5xl flex-col p-4">
				<DialogHeader>
					<DialogTitle className="px-2 pt-2">How it works</DialogTitle>
				</DialogHeader>

				<div className="overflow-auto">
					<Section
						id="the-library"
						title="The Library"
						highlightedId={highlightedId}
					>
						<p>
							As described in the novel, the library contains all possible
							410-page books, each page having 40 lines, and each line having 80
							characters from a set of 29 distinct symbols.
						</p>

						<p>
							There are <Math>410 * 40 * 80 = 1,312,000</Math> characters per
							book, and the number of books in the library is therefore{" "}
							<Math>
								29<sup>1,312,000</sup> ≈ 1.49 * 10<sup>1,918,666</sup>
							</Math>
							.
						</p>

						<p></p>
					</Section>

					<Section id="this-app" title="This app" highlightedId={highlightedId}>
						<p>
							In this app, a book is represented by a number called the{" "}
							<em>book index</em>. The first book in the library is of index{" "}
							<Math>0</Math>, the last one is of index{" "}
							<Math>
								29<sup>1,312,000</sup> - 1
							</Math>
							, which gives the total of{" "}
							<Math>
								29<sup>1,312,000</sup>
							</Math>{" "}
							books in the library.
						</p>

						<p>
							Now, not only this number represents the{" "}
							<strong>location of the book in the library</strong>, it also
							represents the <strong>content of the book</strong>.
						</p>

						<p>
							This is the main difference between this app and all the other
							recreations of the Library of Babel that I know of — like{" "}
							<span className="whitespace-nowrap">
								<ExternalLink href="https://libraryofbabel.info" showIcon>
									libraryofbabel.info
								</ExternalLink>
							</span>{" "}
							by Jonathan Basile, or{" "}
							<span className="whitespace-nowrap">
								<ExternalLink href="https://libraryofbabel.app" showIcon>
									libraryofbabel.app
								</ExternalLink>
							</span>{" "}
							by Tom Snelling. In these apps, the content of a book and the
							identifier are two distinct pieces of data, and a reversible
							algorithm is used to generate one from the other.
						</p>

						<p>
							Here, the <strong>book identifier</strong> and the{" "}
							<strong>book content</strong> are <strong>the same number</strong>
							, simply represented in different bases.
						</p>

						<p>
							The book identifier (or <em>book ID</em>) is the book index
							represented in base 94.
						</p>

						<p>
							The book content is also the book index, but represented in base
							29 (and reversed — see below).
						</p>
					</Section>

					<Section
						id="the-book-id"
						title="The book ID"
						highlightedId={highlightedId}
					>
						<p>
							The <strong>book ID</strong> is the <strong>book index</strong>{" "}
							represented in <strong>base 94</strong>, which is a character set
							made of the 95 printable characters in the first ASCII code page,
							excluding the space. This allows a density almost twice higher
							than representing the number in base 10:{" "}
							<Math>log(94) / log(10) = 1.97</Math>.
						</p>

						<p>
							(We would need a base of 100 to be twice denser than base 10:{" "}
							<Math>log(100) / log(10) = 2</Math>. Indeed, one character in base
							100 stores as much data as two characters in base 10.)
						</p>
					</Section>

					<Section
						id="the-book-content"
						title="The book content"
						highlightedId={highlightedId}
					>
						<p>
							The <strong>book content</strong> is the{" "}
							<strong>book index</strong> represented in{" "}
							<strong>base 29</strong> — a character set made of the space, the
							26 letters of the Latin alphabet, the comma, and the period — and
							reversed.
						</p>

						<p>
							The number <Math>0</Math>, in base 10, is also equal to{" "}
							<Math>00</Math>, <Math>000</Math>, etc. In the same way,{" "}
							<Math>1</Math> is equal to <Math>01</Math>, <Math>001</Math>, etc.
							Whatever how many zeros we put on the left of a number, it doesn't
							change the number's value.
						</p>

						<p>
							Zero, in base 29, is represented by the space. So the content of
							the first book in the library — book index <Math>0</Math> — is
							simply a space. To fill the book with 1,312,000 characters, we
							simply add spaces in the same way we could add zeros to the left
							of any number.
						</p>

						<p>
							However, if we were only doing this, books would give the
							impression to be "filled from the end". Indeed, the content of the
							second book in the library — book index <Math>1</Math> — is simply
							the letter <Code>a</Code>. And this <Code>a</Code> would be placed
							on the last page of the book, on the last line, at the end of the
							line. Every other characters before (1,311,999 of them, all the
							way to the beginning of the book) would be spaces. Then:
						</p>

						<ul className="ml-4 list-inside list-disc">
							<li>
								book index <Math>2</Math> would contain 1,311,999 spaces
								followed by <Code>b</Code>,
							</li>

							<li>
								book index <Math>26</Math>, 1,311,999 spaces followed by{" "}
								<Code>z</Code>,
							</li>

							<li>
								book index <Math>27</Math>, 1,311,999 spaces followed by a
								comma,
							</li>

							<li>
								book index <Math>28</Math>, 1,311,999 spaces followed by a
								period,
							</li>

							<li>
								book index <Math>29</Math>, 1,311,998 spaces followed by the
								letter <Code>a</Code> and a space,
							</li>

							<li>
								book index <Math>30</Math>, 1,311,998 spaces followed by{" "}
								<Code>aa</Code>,
							</li>

							<li>
								book index <Math>31</Math>, 1,311,998 spaces followed by{" "}
								<Code>ab</Code>,
							</li>

							<li>etc.</li>
						</ul>

						<p>
							In order to make the library feel more human friendly, we can
							reverse the content, to make books give the impression to be
							"filled from the beginning". Therefore, the content of the second
							book in the library — book index <Math>1</Math>, which is simply
							the letter <Code>a</Code> — contains this <Code>a</Code> on the
							first page, on the first line, at the beginning of the line, and
							the rest of the book consists of 1,311,999 spaces. Then:
						</p>

						<ul className="ml-4 list-inside list-disc">
							<li>
								book index <Math>2</Math> contains <Code>b</Code> followed by
								1,311,999 spaces,
							</li>

							<li>
								book index <Math>26</Math>, <Code>z</Code> followed by 1,311,999
								spaces,
							</li>

							<li>
								book index <Math>27</Math>, a comma followed by 1,311,999
								spaces,
							</li>

							<li>
								book index <Math>28</Math>, a period followed by 1,311,999
								spaces,
							</li>

							<li>
								book index <Math>29</Math>, a space, the letter <Code>a</Code>,
								then 1,311,998 spaces,
							</li>

							<li>
								book index <Math>30</Math>, <Code>aa</Code> followed by
								1,311,998 spaces,
							</li>

							<li>
								book index <Math>30</Math>, <Code>ba</Code> followed by
								1,311,998 spaces,
							</li>

							<li>etc.</li>
						</ul>

						<p>
							The last book, book index{" "}
							<Math>
								29<sup>1,312,000</sup> - 1
							</Math>
							, contains 1,312,000 periods.
						</p>
					</Section>

					<Section
						id="the-book-image"
						title="The book image"
						highlightedId={highlightedId}
					>
						<p>
							The <strong>book image</strong> is yet another way to represent
							the <strong>book index</strong> — it is still the same number than
							the book ID and the book content.
						</p>

						<p>
							Instead of representing the book index in base 94 (for the book
							ID) or in base 29 reversed (for the book content), we represent it
							in base 4,294,967,296 (
							<Math>
								256<sup>4</sup>
							</Math>
							) reversed. Each "digit" in this system is a pixel in the image,
							being able to take one of 4,294,967,296 different colors.
						</p>

						<p>
							To create the image, we first represent the book index in base
							256. We then group the digits by four, which gives us one pixel in
							the RGBA system: the first value provides the amount of Red; the
							second, of Green; the third, of Blue; and the fourth provides the
							transparency level (named Alpha).
						</p>

						<p>
							Then, we reverse the whole image for the same reason we did it
							with the book content: it gives the impression that the image
							"fills" from the top left, instead of from the bottom right.
						</p>
					</Section>

					<Section
						id="fast-base-conversion-algorithms"
						title="Fast base conversion algorithms"
						highlightedId={highlightedId}
					>
						<p>
							This app manipulates big numbers and converts them from one base
							to another. However, JavaScript's <Code>BigInt</Code> doesn't have
							yet the capability to convert numbers between arbitrary bases, so
							I had to reimplement these algorithms. Read more in{" "}
							<span className="whitespace-nowrap">
								<ExternalLink
									href="https://zwyx.dev/blog/base-conversions-with-big-numbers-in-javascript"
									showIcon
								>
									this blog post
								</ExternalLink>
								.
							</span>
						</p>
					</Section>

					<Section
						id="browsers-limitations"
						title="Browsers limitations"
						highlightedId={highlightedId}
					>
						<p>
							In order to work with entire books, we need to manipulate numbers
							of about 2 millions digits.
						</p>

						<p>
							Google Chrome can work with numbers of up to 300 millions digits —
							well above our needs.
						</p>

						<p>
							However, as of January 2024, Mozilla Firefox and Apple Safari have
							a limit of about 300 thousands digits, which is below our
							requirement. It is therefore impossible in these browsers to
							access books containing more than 67 pages of text (the pages 68
							to 410 must only contain spaces). This makes these browsers able
							to access only a very small percentage of the library: about (1 /
							10 ^ 1,603,011) %. That's a `0.000...0001%` There are 1,603,010
							zeros between the decimal point and the `1`. So that's an
							incredibly small portion of the library, but that's still an
							incredibly large number of books with 315,652 digits.
						</p>

						{/* <p>For an in-depth explanation:</p>

						<p>
							To represent a number containing 1,312,000 base-29 digits, we
							need:
						</p>

						<p>
							<Math>1,312,000 * log(29) / log(2) = 6,373,672</Math> bits,
						</p>

						<p>
							or, <Math>1,312,000 * log(29) / log(10) = 1,918,667</Math> base-10
							digits.
						</p>

						<p>
							(The last book index in the library is equal to{" "}
							<Math>
								29<sup>1,312,000</sup> - 1 = 1.49 * 10<sup>1,918,666</sup>
							</Math>
							, which confirms that 1,918,667 base-10 digits are required to
							represent it.)
						</p>

						<p>
							Based on tests, the highest number supported by{" "}
							<Code>BigInt</Code> in Chrome (
							{`try{1n << ((1n << 30n) - 1n)}catch(e){e}`},
							{`try{(1n << ((1n << 30n) - 1n)) + 1n}catch(e){e}`} is over
							capacity) is{" "}
							<Math>
								2<sup>1,073,741,823</sup>
							</Math>
							which is about equal to
							<Math>
								1 * 10<sup>323,228,496</sup>
							</Math>
						</p>

						<p>
							Based on tests, <Code>BigInt</Code> in Chrome is limited to:
						</p>

						<p>
							<Math>
								2<sup>30</sup> - 1 = 1,073,741,823
							</Math>{" "}
							bits, (not very true: it's 2^((2^30)-1), so one more bit)
						</p>

						<p>
							or,{" "}
							<Math>
								(2<sup>30</sup> - 1) * log(2) / log(10) = 323,228,496
							</Math>{" "}
							base-10 digits.
						</p>

						<p>
							Also based on tests, <Code>BigInt</Code> in Firefox and Safari is
							limited to:
						</p>

						<p>
							<Math>
								2<sup>20</sup> - 1 = 1,048,575
							</Math>{" "}
							bits,
						</p>

						<p>
							or,{" "}
							<Math>
								(2<sup>20</sup> - 1) * log(2) / log(10) = 315,652
							</Math>{" "}
							base-10 digits.
						</p>

						<p>
							The , Firefox and Safari are able to represent
							<Math>
								2
								<sup>
									2<sup>20</sup>
								</sup>
								/(29^1312000)
							</Math>
							(not very true: plus one more bit as well)
						</p> */}
					</Section>

					{/* <Section id="tbd" title="Privacy" highlightedId={highlightedId}>
						This app works entirely offline (client-side). All the computation happens on
						your device, nothing is sent to any server.
						[Note: check what Sentry could leak and reactivate link in banner]
					</Section> */}

					{/* <Section id="tbd" title="Miscellaneous" highlightedId={highlightedId}>
						<p>
							(Note: the novel mentions that the library might repeat itself
							infinitely.)
							<div>
								(A written book that is longer than 410 pages exists in the
								library anyway: it is simply cut into multiple volumes.)
							</div>
						</p>
						<>
							<Code>1,312,000</Code> digits in base <Code>29</Code> (there are
							29 different characters) requires{" "}
							<Code>1,312,000 × log(29) / log(2) = 6,373,672</Code> bits, or{" "}
							<Code>1,312,000 × log(29) / log(10) = 1,918,667</Code> digits in
							base <Code>10</Code>
						</>
						<Code className="mt-2" block>
							<>
								We need 410 x 40 x 80 x log(29) / log(256) = 796709 digits in
								base 256; // there are four values per pixels (RGBA), so our
								image needs to contain // 410 x 40 x 80 x log(29) / log(256) / 4
								= 199178 pixels; // 199178 = 574 x 347
							</>
						</Code>
					</Section>
						[Note: there is a link to reactivate in Library.tsx]
					*/}
				</div>

				<DialogFooter className="px-2 pb-2">
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
	highlightedId: string | undefined;
} & PropsWithChildren) => {
	return (
		<div
			className={cn(
				"my-2 rounded px-2 py-1",
				id === highlightedId && "bg-muted",
			)}
		>
			<AboutDialogLink to={`?about#${id}`}>
				<h3
					data-about-dialog="section-heading"
					id={id}
					className="mb-3 flex w-full font-semibold text-primary"
				>
					<span>{title}</span>
					<span className="text-blue-600 opacity-0">
						&nbsp;&nbsp;#&nbsp;&nbsp;
					</span>
				</h3>
			</AboutDialogLink>

			<div className="[&_code]:mb-3 [&_div]:mb-3 [&_p]:mb-3 [&_ul]:mb-3">
				{children}
			</div>
		</div>
	);
};

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
import { Link, useSearchParams } from "react-router-dom";
import {
	ABOUT,
	ABOUT_DELIMITER,
	AboutDialogId,
	isAboutDialogId,
} from "./AboutDialog.const";
import "./AboutDialog.css";

const NO_HIGHLIGHT = "no-highlight";

type AboutDialogLinkTo =
	`?about${"" | `=${AboutDialogId}${"" | `${typeof ABOUT_DELIMITER}${typeof NO_HIGHLIGHT}`}`}`;

export const AboutDialogLink = ({
	className,
	to,
	onClick,
	children,
}: {
	className?: string;
	to: AboutDialogLinkTo;
	onClick?: () => void;
} & PropsWithChildren) => {
	return (
		<Link className={cn("font-semibold", className)} to={to} onClick={onClick}>
			{children}
		</Link>
	);
};

export const AboutDialogIntro = ({
	showLearnMore,
}: {
	showLearnMore?: boolean;
}) => (
	<>
		<p>
			<ExternalLink
				href="https://en.wikipedia.org/wiki/The_Library_of_Babel"
				showIcon
			>
				"The Library of Babel"
			</ExternalLink>{" "}
			is a short story by Argentine author and librarian Jorge Luis Borges,
			conceiving of a universe in the form of a vast library containing all
			possible 410-page books of a certain format and character set.{" "}
		</p>

		<p className="border-l-2 pl-2 italic">
			All — the detailed history of the future, the autobiographies of the
			archangels, the faithful catalog of the Library, thousands and thousands
			of false catalogs, the proof of the falsity of those false catalogs, a
			proof of the falsity of the true catalog, [...].
		</p>

		<p className="mt-2">This app is a digital recreation of this concept.</p>

		<p>
			It works by manipulating numbers to convert the identifier of a book to
			its content, which also allows to know the book's location in the library.{" "}
			{showLearnMore && (
				<AboutDialogLink
					to={`?about=the-library${ABOUT_DELIMITER}${NO_HIGHLIGHT}`}
				>
					Learn more
				</AboutDialogLink>
			)}
		</p>
	</>
);

export const AboutDialog = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (newOpen: boolean) => void;
}) => {
	const [searchParams] = useSearchParams();

	const about = searchParams.get(ABOUT)?.split(ABOUT_DELIMITER);

	const maybeSelectedId = about?.[0];
	const selectedId =
		isAboutDialogId(maybeSelectedId) ? maybeSelectedId : undefined;

	const noHighlight = about?.[1] === NO_HIGHLIGHT;

	const highlightedId = selectedId && !noHighlight ? selectedId : undefined;

	useEffect(() => {
		// Ensures the highlighted element is accessible by our code
		requestAnimationFrame(
			() => selectedId && document.getElementById(selectedId)?.scrollIntoView(),
		);
	}, [selectedId]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="h-full max-w-5xl p-4">
				<DialogHeader>
					<DialogTitle className="px-2 pt-2">How it works</DialogTitle>
				</DialogHeader>

				<div className="overflow-auto">
					<Section id="intro" highlightedId={highlightedId}>
						<AboutDialogIntro />
					</Section>

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
					</Section>

					<Section id="this-app" title="This app" highlightedId={highlightedId}>
						<p>
							In this app, a book is represented by a number called the{" "}
							<strong>book index</strong>. The first book in the library is of
							index <Math>0</Math>, the last one is of index{" "}
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
							The <strong>book ID</strong> is the{" "}
							<AboutDialogLink to="?about=this-app">book index</AboutDialogLink>{" "}
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
							<AboutDialogLink to="?about=this-app">book index</AboutDialogLink>{" "}
							represented in <strong>base 29</strong> — a character set made of
							the space, the 26 letters of the Latin alphabet, the comma, and
							the period — and reversed.
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

						<ul className="ml-4 list-inside list-disc pl-4 indent-[-1.35rem]">
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

						<ul className="ml-4 list-inside list-disc pl-4 indent-[-1.35rem]">
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
							the{" "}
							<AboutDialogLink to="?about=this-app">book index</AboutDialogLink>{" "}
							— it is still the same number as the{" "}
							<AboutDialogLink to="?about=the-book-id">book ID</AboutDialogLink>{" "}
							and the{" "}
							<AboutDialogLink to="?about=the-book-content">
								book content
							</AboutDialogLink>
							.
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

					<Section id="privacy" title="Privacy" highlightedId={highlightedId}>
						<p className="mt-4 text-sm font-semibold">Disclaimer</p>

						<p>
							The following statements are made to the best of my knowledge, but
							are not guaranteed. Many things could happen that could compromise
							the data you enter and get from this app (software bug,
							vulnerability, etc.).
						</p>

						<p className="mt-4 text-sm font-semibold">Book production</p>

						<p>
							The calculations made to produce books run entirely on your
							device. They are written in JavaScript and executed by your web
							browser's JavaScript engine. Nothing is sent to any server during
							this step.
						</p>

						<p className="mt-4 text-sm font-semibold">Share feature</p>

						<p>
							The Share feature uses end-to-end encryption. When using the Share
							feature, the current book index is encrypted using the{" "}
							<ExternalLink
								href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm"
								showIcon
							>
								AES-GCM
							</ExternalLink>{" "}
							algorithm. The resulting encrypted content is sent to a server,
							which stores it and returns an identifier. The encryption key
							never leaves your device. The link, which is then provided to you,
							is in the format:
						</p>

						<Code block>
							{location.origin}/&lt;identifier&gt;#&lt;encryption-key&gt;
						</Code>

						<p>
							When entering this link in a web browser, or directly in the
							Library of Babel, the decryption key (the part following the{" "}
							<Code>#</Code>) stays on the user's device. Only the identifier is
							sent to a server, in order to retrieve the corresponding encrypted
							content. This encrypted content is then decrypted, on the user's
							device, using the decryption key.
						</p>

						<p className="border-l-2 pl-2">
							<strong>Note</strong>: do not rely on the Share feature being
							available indefinitely. Servers can go down at any time. If a
							particular book is important to you, make sure to have your own
							backup of its book ID.
						</p>

						<p className="mt-6 text-sm font-semibold">
							Analytics and error reporting
						</p>

						<p>
							Analytics and error reporting code has been implemented
							specifically for the Library of Babel, in order to remove the need
							to load third-party scripts at runtime, and to ensure that data
							sent does not contain sensitive information. Please consult our
							privacy policy accessible from the main menu to learn more about
							the information that may be collected.
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
							Google Chrome's JavaScript engine allows us to work with numbers
							of more than 300 millions digits — well above our needs.
						</p>

						<p>
							However, as of January 2024, the JavaScript engines of Mozilla
							Firefox and Apple Safari have a limit of about 300 thousands
							digits, which is below our requirement. It is therefore impossible
							in these browsers to access books containing more than 67 pages of
							text (the rest of the pages being full of spaces). This makes
							these browsers able to access only a very small portion of the
							library:{" "}
							<Math>
								1 / 10<sup>1,603,011</sup>
							</Math>
							, so <Math>0.000...0001%</Math> with 1,603,008 zeros between the
							decimal point and the <Math>1</Math>. That is an incredibly small
							portion of the library, but it's still an incredibly large amount
							of books.
						</p>

						<p className="border-l-2 pl-2">
							<strong>Note</strong>: Apple prevents its users from installing
							any third party browser engines on iOS. Therefore, it is
							impossible to fully use The Library of Babel on iOS. (Google
							Chrome and Mozilla Firefox, on iOS, are only interfaces — they
							actually run Apple's engine to browse the web.) Read more at{" "}
							<span className="whitespace-nowrap">
								<ExternalLink
									href="https://open-web-advocacy.org/apple-browser-ban"
									showIcon
								>
									open-web-advocacy.org/apple-browser-ban
								</ExternalLink>
								.
							</span>
						</p>

						<p className="mt-6 text-sm font-semibold">In-depth explanation</p>

						<div>
							To represent a number containing 1,312,000 base-29 digits, we
							need:
							<ul className="ml-4 list-inside list-disc pl-4 indent-[-1.35rem]">
								<li>
									<Math>1,312,000 * log(29) / log(2) = 6,373,672</Math> bits,
									or,
								</li>
								<li>
									<Math>1,312,000 * log(29) / log(10) = 1,918,667</Math> base-10
									digits.
								</li>
							</ul>
						</div>

						<p>
							(The last book index in the library is{" "}
							<Math>
								29<sup>1,312,000</sup> - 1 = 1.49 * 10<sup>1,918,666</sup>
							</Math>
							, which confirms that 1,918,667 base-10 digits are required to
							represent it.)
						</p>

						<p>
							To find out what the highest supported number in a browser is, we
							can use the developer tools' console:
						</p>

						<p>
							<Code block>
								{"try{ 1n << ((1n << 30n) - 1n) } catch (e) { e }"}
							</Code>
						</p>

						<p>
							This number, equal to{" "}
							<Math>
								2<sup>1,073,741,823</sup>
							</Math>{" "}
							(about{" "}
							<Math>
								10<sup>323,228,496</sup>
							</Math>{" "}
							— a number with 323,228,496 digits), is accepted in Chrome.
						</p>

						<p>However, the following one:</p>

						<p>
							<Code block>
								{"try{ (1n << ((1n << 30n) - 1n)) + 1n } catch (e) { e }"}
							</Code>
						</p>

						<p>
							which is equal to{" "}
							<Math>
								2<sup>1,073,741,823</sup> + 1
							</Math>
							,leads to the error{" "}
							<Code>RangeError: Maximum BigInt size exceeded</Code>.
						</p>

						<p>
							In Mozilla Firefox and Apple Safari, as of January 2024, the
							maximum number is:
						</p>

						<p>
							<Code block>
								{"try{ 1n << ((1n << 20n) - 1n) } catch (e) { e }"}
							</Code>
						</p>

						<p>
							which is equal to{" "}
							<Math>
								2<sup>1,048,575</sup>
							</Math>
							, about{" "}
							<Math>
								10<sup>315,652</sup>
							</Math>{" "}
							— a number with only 315,653 digits.
						</p>
					</Section>

					<Section
						id="miscellaneous"
						title="Miscellaneous"
						highlightedId={highlightedId}
					>
						<p className="mt-6 text-sm font-semibold">Longer books</p>

						<p>
							A written book that is longer than 410 pages exists in the library
							anyway: it is simply cut into multiple volumes.
						</p>

						<p className="mt-6 text-sm font-semibold">Books order</p>

						<p>
							The novel gives a hint that the books might be ordered
							sequentially in the library: the narrator states that some people
							condemn whole shelves of books.
						</p>

						<p>
							It wouldn't make sense to condemn a particular shelf if the books
							in it are completely different from each other. But if ordered
							sequentially, the books on a shelf are almost identical, which
							makes condemning wholes shelves of books — because they contain
							something to censure — a rational idea. (Although "rational" is
							probably not a word that can be used a lot when speaking about the
							Library of Babel.)
						</p>

						<p>
							Another hint though, highlighted by Tom Snelling during a{" "}
							<span className="whitespace-nowrap">
								<ExternalLink
									href="https://github.com/tdjsnelling/babel/issues/3"
									showIcon
								>
									discussion
								</ExternalLink>
								,
							</span>{" "}
							has the narator stating that his father once saw a book consisting
							of the letters <Code>M C V</Code> repeated from the first line to
							the last. This seems to indicate that books might be ordered
							randomly instead, otherwise there would be many very similar books
							next to this one, and finding it wouldn't be like finding a needle
							in a haystack. (Statistically though, finding such a repeating
							pattern in randomly ordered books seems highly unlikely.)
						</p>

						<p>
							We are most probably overthinking and pushing the concept further
							than Jorge Luis Borges intended, so we can simply conclude that
							the books order isn't explicitely mentioned in the novel, and that
							some creators of digital Libraries of Babel have chosen to
							consider the books ordered randomly, whereas I choose to consider
							them ordered sequentially.
						</p>
					</Section>
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
	title?: string;
	highlightedId: string | undefined;
} & PropsWithChildren) => {
	return (
		<div
			id={id}
			className={cn(
				"my-2 rounded px-2 py-1",
				id === highlightedId && "bg-muted",
			)}
		>
			{title && (
				<AboutDialogLink to={`?about=${id}`}>
					<h3 className="mb-3 flex w-full font-semibold text-primary">
						<span>{title}</span>
						<span className="text-info opacity-0">
							&nbsp;&nbsp;#&nbsp;&nbsp;
						</span>
					</h3>
				</AboutDialogLink>
			)}

			<div className="[&_code]:mb-3 [&_div]:mb-3 [&_p]:mb-3 [&_ul]:mb-3">
				{children}
			</div>
		</div>
	);
};

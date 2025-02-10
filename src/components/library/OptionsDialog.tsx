import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	BASES_QUOTIENT,
	CHARS_PER_PAGE,
	LibraryMode,
	OptionsDialogSettings,
	PAGES_PER_BOOK,
	RandomOptions,
	SearchOptions,
} from "@/lib/common";
import { OPTIONS_DIALOG_SETTINGS_KEY } from "@/lib/local-storage-keys";
import { useHistoryState } from "@/lib/useHistoryState.const";
import { cn, getReadableFileSize } from "@/lib/utils";
import { LucideSettings } from "lucide-react";
import { equals } from "ramda";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AboutDialogLink } from "./about/AboutDialog";

const AUTORERUN_ID = "autorerun";

export const OptionsDialog = ({
	mode,
	searchOptions,
	randomOptions,
	disabled,
	onSearchOptionsChange,
	onRandomOptionsChange,
	onRerun,
}: {
	mode: LibraryMode;
	searchOptions: SearchOptions;
	randomOptions: RandomOptions;
	disabled: boolean;
	onSearchOptionsChange: (newSearchOptions: SearchOptions) => void;
	onRandomOptionsChange: (newRandomOptions: RandomOptions) => void;
	onRerun: () => void;
}) => {
	const [settings, setSettings] = useLocalStorage<OptionsDialogSettings>(
		OPTIONS_DIALOG_SETTINGS_KEY,
		{
			autoRerun: true,
			searchCustomNumberOfPages: 10,
			randomCustomNumberOfPages: 10,
		},
	);

	const optionsAtDialogOpening = useRef<
		SearchOptions | RandomOptions | undefined
	>();

	const { state, pushStateOrNavigateBack } = useHistoryState<{
		open: boolean;
	}>();

	const customNumberOfPages =
		mode === "search" ?
			settings.searchCustomNumberOfPages
		:	settings.randomCustomNumberOfPages;

	const options = mode === "search" ? searchOptions : randomOptions;

	const choice =
		options.numberOfPages === 0 ? "firstBook"
		: options.numberOfPages === 1 ? "firstPage"
		: options.numberOfPages > 1 && options.numberOfPages < PAGES_PER_BOOK ?
			"firstXPages"
		:	"fullBook";

	const minRawNumberOfPages = 2;
	const maxRawNumberOfPages = PAGES_PER_BOOK - 1;

	const [rawNumberOfPages, setRawNumberOfPages] = useState<string | number>(
		choice === "firstXPages" ? options.numberOfPages : customNumberOfPages,
	);
	const [rawNumberOfPagesInvalid, setRawNumberOfPagesInvalid] =
		useState<boolean>(false);

	useEffect(() => {
		setRawNumberOfPages(
			choice === "firstXPages" ? options.numberOfPages : customNumberOfPages,
		);
	}, [choice, options.numberOfPages, customNumberOfPages]);

	const getBookIdSize = (numberOfPages_: number) =>
		getReadableFileSize(
			Math.ceil(numberOfPages_ * CHARS_PER_PAGE * BASES_QUOTIENT),
			"decimal",
		);

	const onOptionChange = (newOptions: typeof options) =>
		(mode === "search" ? onSearchOptionsChange : onRandomOptionsChange)(
			newOptions,
		);

	return (
		<Dialog
			open={!!state.open}
			onOpenChange={(open) => {
				pushStateOrNavigateBack(open, { open: true });

				if (open) {
					optionsAtDialogOpening.current = options;
				} else {
					if (
						settings.autoRerun &&
						!equals(optionsAtDialogOpening.current, options)
					) {
						onRerun();
					}
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					className={cn(mode !== "search" && mode !== "random" && "invisible")}
					variant="outline"
					size="sm"
					title="Search settings"
					disabled={disabled}
				>
					<LucideSettings />
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-full overflow-auto">
				<DialogHeader>
					<DialogTitle>
						{mode === "search" ? "Search settings" : "Settings"}
					</DialogTitle>
				</DialogHeader>

				<RadioGroup
					className="mt-4 flex flex-col gap-4"
					value={choice}
					onValueChange={(newChoice: typeof choice) => {
						const newNumberOfPages =
							newChoice === "firstBook" ? 0
							: newChoice === "firstPage" ? 1
							: newChoice === "firstXPages" ? customNumberOfPages
							: PAGES_PER_BOOK;

						onOptionChange({ numberOfPages: newNumberOfPages });
						setRawNumberOfPagesInvalid(false);
					}}
				>
					{mode === "search" && (
						<RadioGroupElement<typeof choice>
							id="firstBook"
							title="Find the first book containing the search text"
							subtitle={
								<>
									The size of the{" "}
									<AboutDialogLink to="?about=the-book-id">
										book ID
									</AboutDialogLink>{" "}
									will be about{" "}
									<strong>{Math.round(BASES_QUOTIENT * 100) / 100}</strong>{" "}
									times the size of the search text.
								</>
							}
							// eslint-disable-next-line jsx-a11y/no-autofocus -- useful in this case
							autoFocus
						/>
					)}

					<RadioGroupElement<typeof choice>
						id="firstPage"
						title={`${mode === "search" ? "Find" : "Return"} a book with one page of text`}
						subtitle={
							mode === "search" ?
								<>
									The first page of the book will contain the search text,
									surrounded by random characters. The rest of the pages will be
									blank. The size of book ID will be about{" "}
									<strong>{getBookIdSize(1)}</strong>. If the search text is
									longer than the number of characters per page (
									{CHARS_PER_PAGE}
									), then it's the first book containing the search text that
									will be returned.
								</>
							:	<>
									The rest of the pages will be blank. The size of{" "}
									<AboutDialogLink to="?about=the-book-id">
										book ID
									</AboutDialogLink>{" "}
									will be about <strong>{getBookIdSize(1)}</strong>.
								</>
						}
						// eslint-disable-next-line jsx-a11y/no-autofocus -- useful in this case
						autoFocus={mode !== "search"}
					/>

					<RadioGroupElement<typeof choice>
						id="firstXPages"
						title={
							<div className="mt-[-0.55rem] flex items-center gap-2">
								{mode === "search" ? "Find" : "Return"} a book with
								<Input
									className="w-[5rem]"
									variantSize="sm"
									state={rawNumberOfPagesInvalid ? "error" : "default"}
									type="number"
									min={minRawNumberOfPages}
									max={maxRawNumberOfPages}
									value={rawNumberOfPages}
									onChange={(e) => {
										const newRawNumberOfPages = e.target.value;
										const newNumberOfPages = parseInt(newRawNumberOfPages);

										if (
											newNumberOfPages >= minRawNumberOfPages &&
											newNumberOfPages <= maxRawNumberOfPages
										) {
											setSettings(
												(prevSettings) =>
													({
														...prevSettings,
														...(mode === "search" ?
															{ searchCustomNumberOfPages: newNumberOfPages }
														:	{ randomCustomNumberOfPages: newNumberOfPages }),
													}) satisfies OptionsDialogSettings,
											);

											setRawNumberOfPagesInvalid(false);

											onOptionChange({ numberOfPages: newNumberOfPages });
										} else {
											setRawNumberOfPagesInvalid(true);
										}

										setRawNumberOfPages(newRawNumberOfPages);
									}}
								/>
								pages of text
							</div>
						}
						subtitle={
							rawNumberOfPagesInvalid ? "Invalid value" : (
								<>
									The size of book ID will be about{" "}
									<strong>{getBookIdSize(customNumberOfPages)}</strong>.
								</>
							)
						}
						disableSelectionPrevention
					/>

					<RadioGroupElement<typeof choice>
						id="fullBook"
						title={`${mode === "search" ? "Find" : "Return"} a full book`}
						subtitle={
							<>
								There will be no blank pages (probably) — the size of book ID
								will be about <strong>{getBookIdSize(PAGES_PER_BOOK)}</strong>.
							</>
						}
					/>
				</RadioGroup>

				<div className="mt-4 flex items-center gap-2">
					<Checkbox
						id={AUTORERUN_ID}
						checked={settings.autoRerun}
						onCheckedChange={(newChecked) =>
							setSettings((prevSettings) => ({
								...prevSettings,
								autoRerun: !!newChecked,
							}))
						}
					/>

					<Label htmlFor={AUTORERUN_ID}>
						{mode === "search" ?
							"Run a new search automatically"
						:	"Pick a new book automatically"}
					</Label>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const RadioGroupElement = function <T extends string>({
	id,
	title,
	subtitle,
	disableSelectionPrevention,
	autoFocus,
}: {
	id: T;
	title: string | JSX.Element;
	subtitle?: string | JSX.Element;

	/**
	 * Radix's label primitive from `@radix-ui/react-label` prevents text selection
	 * when double clicking the label, which prevent a smooth usage of the "up/down" arrows
	 * of an `input` element of type `number`;
	 * using this option uses Radix's label primitive from `@radix-ui/react-primitive`, which
	 * doesn't have this feature
	 */
	disableSelectionPrevention?: boolean;

	/**
	 * This is to prevent the input from having the focus when the dialog opens,
	 * as `focus-visible` on inputs behave like `focus` and are always visible
	 */
	autoFocus?: boolean;
}) {
	return (
		<div className="flex gap-2">
			<RadioGroupItem
				className="mt-0.5 flex-shrink-0"
				id={id}
				value={id}
				// eslint-disable-next-line jsx-a11y/no-autofocus -- useful in this case
				autoFocus={autoFocus}
			/>

			<Label
				className="text-sm"
				htmlFor={id}
				disableSelectionPrevention={disableSelectionPrevention}
			>
				<div className="font-medium">{title}</div>
				<div className="mt-0.5 font-normal text-muted-foreground">
					{subtitle}
				</div>
			</Label>
		</div>
	);
};

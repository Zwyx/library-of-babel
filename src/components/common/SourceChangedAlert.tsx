import { SmallAlert } from "./SmallAlert";

export const SourceChangedAlert = ({
	bookIdChanged,
	bookImageChanged,
	searchTextChanged,
}: {
	bookIdChanged: boolean;
	bookImageChanged: boolean;
	searchTextChanged: boolean;
}) =>
	(bookIdChanged || bookImageChanged || searchTextChanged) && (
		<SmallAlert>
			The{" "}
			{bookIdChanged ?
				"book ID"
			: bookImageChanged ?
				"book image"
			:	"search text"}{" "}
			has been modified since this book was produced.
		</SmallAlert>
	);

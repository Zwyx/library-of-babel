#!/bin/bash

set -e

echo "Converting annotated tags to lightweight tags..."

git for-each-ref --format="%(objecttype) %(refname:short) %(*objectname)" "refs/tags/*" | while IFS= read -r line; do
	type=$(echo "$line" | cut -f 1 -d " ")
	tag=$(echo "$line" | cut -f 2 -d " ")
	hash=$(echo "$line" | cut -f 3 -d " ")

	if [ "$type" = "tag" ]; then
		git tag -d "$tag"
		git tag "$tag" "$hash"
	fi
done

echo "Tag conversion finished."
echo

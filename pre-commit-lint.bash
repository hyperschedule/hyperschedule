#!/bin/bash

if [ $# -eq 0 ]; then
    echo "No indexed files to lint!" >&2
    exit 1
fi

fail=0

for file in "$@"; do
    temp_record=$(git checkout-index --temp "$file")
    temp_file=$(echo "$temp_record" | cut -f 1)
    echo "linting '$file'..."
    yarn eslint --quiet --no-ignore "$temp_file"
    if ! [ $? -eq 0 ]; then
        echo "lint errors found!"
        fail=$((fail + 1))
    fi
    rm "$temp_file"
done

if [ $fail -gt 0 ]; then
    echo "lint errors found for $fail files!"
    exit 2
fi

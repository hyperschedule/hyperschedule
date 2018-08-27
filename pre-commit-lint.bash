#!/bin/bash

if [ $# -eq 0 ]; then
    echo "No indexed files to lint!" >&2
    exit 1
fi

fail=0

for file in "$@"; do
    temp_record=$(git checkout-index --temp "$file")
    temp_file=$(echo "$temp_record" | cut -f 1)

    echo "Linting '$file'..."

    ext=${file##*.}
    temp_file_ext="$temp_file.$ext"

    mv "$temp_file" "$temp_file_ext"

    code=0
    case "$ext" in
        json)
            yarn prettier --parser json --list-different "$temp_file_ext"
            code=$?
            ;;
        js|jsx)
            yarn eslint --no-ignore "$temp_file_ext"
            code=$?
            ;;
        *)
    esac

    if ! [ $code -eq 0 ]; then
        echo "Lint errors found for '$file'!"
        fail=$((fail + 1))
    fi

    rm "$temp_file_ext"

done

if [ $fail -gt 0 ]; then
    echo "Lint errors found for $fail file(s)!"
    exit 2
fi

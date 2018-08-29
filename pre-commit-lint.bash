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

    dir=$(dirname "$file")
    ext=${file##*.}
    temp_target="$dir/$temp_file.$ext"

    mv "$temp_file" "$temp_target"

    code=0
    case "$ext" in
        json)
            yarn prettier --parser json --list-different "$temp_target"
            code=$?
            ;;
        css)
            yarn prettier --parser css --list-different "$temp_target"
            code=$?
            ;;
        js|jsx)
            yarn eslint --ignore-pattern '!.*' "$temp_target"
            code=$?
            ;;
        *)
    esac

    if ! [ $code -eq 0 ]; then
        echo "Lint errors found for '$file'!"
        fail=$((fail + 1))
    fi

    rm "$temp_target"

done

if [ $fail -gt 0 ]; then
    echo "Lint errors found for $fail file(s)!"
    exit 2
fi

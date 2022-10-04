# Hyperschedule v2

## Install

```
yarn install
```

Run backend

```
yarn backend
```

Run frontend

```
yarn frontend
```

## Pre-commit hook

To avoid accidentally pushing broken code, it is recommended that
you create a new file `.git/hooks/pre-commit`, write the following contents 
into the file

``` 
#!/bin/bash

run-script(){
  printf '\033[95mRunning "yarn %s" \033[0m\n' $1
  yarn "$1"
  if (( $? )); then
    printf '\033[91mCommand "yarn %s failed", commit aborted.\033[0m\n' $1
    exit 1
  fi
}

run-script format-check
run-script lint
run-script test

printf '\033[95mPre-commit checks completed\033[0m\n'
```

then run `chmod +x .git/hooks/pre-commit`.

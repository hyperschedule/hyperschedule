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
you add a pre-commit hook to your local repository. You may do so 
by running 
```shell
cp hooks/pre-commit .git/hooks/pre-commit
```

If you feel more adventurous, you may create a symlink instead so it can
be updated alone with our CI. 

```shell
ln -s $(pwd)/hooks/pre-commit .git/hooks/pre-commit
```

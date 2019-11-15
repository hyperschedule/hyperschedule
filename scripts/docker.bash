#!/usr/bin/env bash

set -e
set -o pipefail

args=(bash)
if [[ -n "$1" ]]; then
    args=("${args[@]}" -c "$1")
fi

docker() {
    if [[ "$OSTYPE" != darwin* ]] && [[ "$EUID" != 0 ]]; then
        command sudo docker "$@"
    else
        command docker "$@"
    fi
}

PORT="${PORT:-5000}"
HMR_PORT="${HMR_PORT:-54321}"

docker build . -t hyperschedule --build-arg "UID=$UID"
docker run -it --rm \
       -v "$PWD:/home/docker/hyperschedule" \
       -e "PORT=${PORT}" -p "${PORT}:${PORT}" \
       -e "HMR_PORT=${HMR_PORT}" -p "${HMR_PORT}:${HMR_PORT}" \
       hyperschedule "${args[@]}"

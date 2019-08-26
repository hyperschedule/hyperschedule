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

docker build . -t hyperschedule --build-arg "UID=$UID"
docker run -it --rm \
       -v "$PWD:/home/docker/hyperschedule" \
       -e "HOST=0.0.0.0" -e "HOST_DISPLAY=localhost" \
       -e "PORT=${PORT}" -p "${PORT}:${PORT}" \
       hyperschedule "${args[@]}"

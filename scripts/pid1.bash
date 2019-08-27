#!/usr/bin/env bash

set -e
set -o pipefail

yarn install
exec "$@"

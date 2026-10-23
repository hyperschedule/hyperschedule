#!/bin/sh
set -eu

fetch() {
    curl --fail --silent --show-error --location --retry 5 --retry-all-errors --retry-delay 1 --connect-timeout 15 "$@"
}

fetch https://github.com/ohmyzsh/ohmyzsh/archive/2100c630ba4bd67bb48802c3e7da893a4fdaa1a0.tar.gz -o /tmp/ohmyzsh.tgz
echo '926a97ef45a948aa014ca15d5d880b34cfd69ebde4f81cd33df845972784f469  /tmp/ohmyzsh.tgz' | sha256sum -c -
mkdir -p /opt/ohmyzsh
tar -xzf /tmp/ohmyzsh.tgz -C /opt/ohmyzsh --strip-components=1

fetch https://github.com/zsh-users/zsh-autosuggestions/archive/e52ee8ca55bcc56a17c828767a3f98f22a68d4eb.tar.gz -o /tmp/autosuggestions.tgz
echo '166fad9326c99904fd3b16b5d770efb4f5df39a674599e72bba8fc41636ab065  /tmp/autosuggestions.tgz' | sha256sum -c -
mkdir -p /opt/ohmyzsh/custom/plugins/zsh-autosuggestions
tar -xzf /tmp/autosuggestions.tgz -C /opt/ohmyzsh/custom/plugins/zsh-autosuggestions --strip-components=1

fetch https://registry.npmjs.org/pure-prompt/-/pure-prompt-1.28.4.tgz -o /tmp/pure.tgz
echo '21df1db56349c485df514e45e2de038339c7d1a1da376740a9066fbb38e52aff  /tmp/pure.tgz' | sha256sum -c -
mkdir -p /opt/pure
tar -xzf /tmp/pure.tgz -C /opt/pure --strip-components=1
rm /tmp/ohmyzsh.tgz /tmp/autosuggestions.tgz /tmp/pure.tgz

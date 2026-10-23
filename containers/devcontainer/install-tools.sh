#!/bin/sh
set -eu

fetch() {
    curl --fail --silent --show-error --location --retry 5 --retry-all-errors --retry-delay 1 --connect-timeout 15 "$@"
}

# Only the Docker client is needed: it talks to the host's Docker/Podman API.
case "$(dpkg --print-architecture)" in
    amd64) docker_arch=x86_64; docker_sha=9ac225999fd5e863f7694c728ef23d480616b1e5639328fa309befd4243d69eb ;;
    arm64) docker_arch=aarch64; docker_sha=873b3e0207857c3b2f28392fb922f3ea6efe37620c16d4d4aaf2fef409c90b73 ;;
    *) echo 'The development container supports amd64 and arm64.' >&2; exit 1 ;;
esac
fetch "https://download.docker.com/linux/static/stable/$docker_arch/docker-29.9.2.tgz" -o /tmp/docker.tgz
echo "$docker_sha  /tmp/docker.tgz" | sha256sum -c -
tar -xzf /tmp/docker.tgz -C /usr/local/bin --strip-components=1 docker/docker
mkdir -p /usr/local/share/doc/docker-cli
fetch https://raw.githubusercontent.com/docker/cli/v29.9.2/LICENSE -o /usr/local/share/doc/docker-cli/LICENSE
echo '2d81ea060825006fc8f3fe28aa5dc0ffeb80faf325b612c955229157b8c10dc0  /usr/local/share/doc/docker-cli/LICENSE' | sha256sum -c -
fetch https://raw.githubusercontent.com/docker/cli/v29.9.2/NOTICE -o /usr/local/share/doc/docker-cli/NOTICE
echo 'a8c869fbda819afb8d80e0ac19bac52e766bc6c19cb38cf94f52d64c4be2aab6  /usr/local/share/doc/docker-cli/NOTICE' | sha256sum -c -

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
rm /tmp/docker.tgz /tmp/ohmyzsh.tgz /tmp/autosuggestions.tgz /tmp/pure.tgz

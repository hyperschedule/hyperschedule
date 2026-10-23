#!/bin/sh
set -eu

curl -fsSL https://github.com/google/brotli/archive/refs/tags/v1.2.1.tar.gz -o /tmp/brotli.tar.gz
echo '98d35d11a78dc453aebb7d10c3748f3f73ff78c8267c0dc697b8631f67bf7e8f  /tmp/brotli.tar.gz' | sha256sum -c -
mkdir /tmp/brotli-source
tar -xzf /tmp/brotli.tar.gz -C /tmp/brotli-source --strip-components=1
multiarch=$(dpkg-architecture -qDEB_HOST_MULTIARCH)
cmake -S /tmp/brotli-source -B /tmp/brotli-build \
    -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr \
    -DCMAKE_INSTALL_LIBDIR="lib/$multiarch" \
    -DBUILD_SHARED_LIBS=ON -DBROTLI_BUILD_TOOLS=ON -DBROTLI_DISABLE_TESTS=OFF
cmake --build /tmp/brotli-build --parallel 2
ctest --test-dir /tmp/brotli-build --output-on-failure --parallel 2
DESTDIR=/tmp/brotli-install cmake --install /tmp/brotli-build

mkdir -p "/tmp/brotli-package/usr/lib/$multiarch" /tmp/brotli-package/DEBIAN /out
cp -a "/tmp/brotli-install/usr/lib/$multiarch/"libbrotli*.so* "/tmp/brotli-package/usr/lib/$multiarch/"
mkdir -p /tmp/brotli-package/usr/share/doc/libbrotli1
cp /tmp/brotli-source/LICENSE /tmp/brotli-package/usr/share/doc/libbrotli1/copyright
cat > /tmp/brotli-package/DEBIAN/control <<EOF
Package: libbrotli1
Version: 1.2.1-1+hyperschedule1
Architecture: $(dpkg --print-architecture)
Multi-Arch: same
Maintainer: Hyperschedule maintainers
Depends: libc6
Section: libs
Priority: optional
Description: Brotli shared libraries with the CVE-2026-111497 fix
 Built from the checksum-verified upstream v1.2.1 source release.
EOF
dpkg-deb --root-owner-group --build /tmp/brotli-package /out/libbrotli1.deb

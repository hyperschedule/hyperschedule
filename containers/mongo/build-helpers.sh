#!/bin/sh
set -eu

cd /src/gosu
go mod download
go mod verify
# Keep Go build metadata for vulnerability scanners (do not use -s).
CGO_ENABLED=0 go build -p 2 -mod=readonly -buildvcs=false -trimpath \
    -ldflags '-w' -o /out/gosu .

cd /src/tools
go mod download
go mod verify
for tool in bsondump mongodump mongorestore mongoimport mongoexport mongostat mongotop mongofiles; do
    # Match upstream Linux features, including Kerberos, PIE and version output.
    # Explicit module mode avoids the upstream archive's stale vendor directory.
    CGO_ENABLED=1 go build -p 2 -mod=readonly -buildvcs=false -trimpath \
        -tags 'gssapi failpoints' -buildmode=pie \
        -ldflags '-X main.VersionStr=100.19.1 -X main.GitCommit=9348e032419d906e40966f477278cce647b9b1eb' \
        -o "/out/$tool" "./$tool/main/$tool.go"
done

go version -m /out/gosu /out/mongodump /out/mongorestore

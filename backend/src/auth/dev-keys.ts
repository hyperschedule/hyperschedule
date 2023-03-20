/*
To generate new keys, run

openssl ecparam -name secp521r1 -genkey -noout -out privkey.pem
openssl ec -in dev-privkey.pem -pubout > pubkey.pem
 */

const PUBKEY = `
-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAdGbNGJ/BJ3RNDXqOuKRF9Yv7dOVh
vbEHrcVFPUO3tso6cthzGLqIaw/Xth7TXWWCFkbtxztluuNrUdu+WiJ2U9AAcQ8S
aXN/JO4j+zSjzDe+sWyZioyl35xM4SKwRFsV4WnGa+6yJKvfJOS3RN6q9gGwCZVG
ql8Z1GbtKVbG8xsfSkE=
-----END PUBLIC KEY-----
`;
const PRIVKEY = `
-----BEGIN EC PRIVATE KEY-----
MIHcAgEBBEIAXvMaYzm+OcaiHi4F03q03oooFJF3TWXncEoFTI2oVaqFtpaDJVnv
cVUm6/tWWaIH1Yow9L888q0bQqwdU+FbF5egBwYFK4EEACOhgYkDgYYABAB0Zs0Y
n8EndE0Neo64pEX1i/t05WG9sQetxUU9Q7e2yjpy2HMYuohrD9e2HtNdZYIWRu3H
O2W642tR275aInZT0ABxDxJpc38k7iP7NKPMN76xbJmKjKXfnEzhIrBEWxXhacZr
7rIkq98k5LdE3qr2AbAJlUaqXxnUZu0pVsbzGx9KQQ==
-----END EC PRIVATE KEY-----
`;
export { PUBKEY, PRIVKEY };

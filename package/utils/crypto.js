export function cryptoDigest(algo = "md5", data, digest = "hex") {
    const hasher = new Bun.CryptoHasher(algo);
    hasher.update(data);
    return hasher.digest(digest);
}

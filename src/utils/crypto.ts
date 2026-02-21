/**
 * Generates a cryptographic digest for the given data using the specified algorithm.
 *
 * @param {Bun.SupportedCryptoAlgorithms} [algo="md5"] - The hashing algorithm to use. Supported algorithms include "md5", "sha1", "sha256", "sha512", etc.
 * @param {Bun.BlobOrStringOrBuffer} data - The data to hash. Can be a string, ArrayBuffer, TypedArray, or Blob.
 * @param {Bun.DigestEncoding} [digest="hex"] - The encoding of the output digest. Common values are "hex", "base64", or "binary".
 * @returns {string} The resulting hash of the input data in the specified encoding.
 */
export function cryptoDigest(
    algo: Bun.SupportedCryptoAlgorithms = "md5",
    data: Bun.BlobOrStringOrBuffer,
    digest: Bun.DigestEncoding = "hex",
): string {
    const hasher = new Bun.CryptoHasher(algo);
    hasher.update(data);
    return hasher.digest(digest);
}

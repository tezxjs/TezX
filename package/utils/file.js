import { TezXError } from "../core/error.js";
import { runtime } from "./runtime.js";
export async function fileExists(path) {
    switch (runtime) {
        case "node": {
            const { access } = await import("node:fs/promises");
            try {
                await access(path);
                return true;
            }
            catch {
                return false;
            }
        }
        case "bun":
            return Bun.file(path).exists();
        case "deno":
            try {
                await Deno.stat(path);
                return true;
            }
            catch {
                return false;
            }
        default:
            return false;
    }
}
export async function getFileBuffer(path) {
    switch (runtime) {
        case "node": {
            const { readFile } = await import("node:fs/promises");
            return readFile(path);
        }
        case "bun": {
            return new Uint8Array(await Bun.file(path).arrayBuffer());
        }
        case "deno":
            return Deno.readFile(path);
        default:
            throw new TezXError("Unsupported runtime environment");
    }
}
export async function readStream(path) {
    switch (runtime) {
        case "node": {
            const { createReadStream } = await import("node:fs");
            const { Readable } = await import("node:stream");
            return Readable.toWeb(createReadStream(path));
        }
        case "bun": {
            return Bun.file(path).stream();
        }
        case "deno": {
            return (await Deno.open(path, { read: true })).readable;
        }
        default:
            throw new TezXError("Unsupported runtime environment");
    }
}
export async function fileSize(path) {
    switch (runtime) {
        case "node": {
            const { stat } = await import("node:fs/promises");
            const st = await stat(path);
            return { size: st.size, mtime: st.mtime };
        }
        case "bun": {
            const st = await Bun.file(path).stat();
            return { size: st.size, mtime: st.mtime };
        }
        case "deno": {
            const st = await Deno.stat(path);
            return {
                size: st.size,
                mtime: st.mtime ?? new Date(),
            };
        }
        default:
            throw new TezXError("Unsupported runtime: " + runtime);
    }
}
export async function etagDigest(algo = "MD5", data) {
    const encoded = typeof data === "string" ? new TextEncoder().encode(data) : data;
    if (runtime === "bun") {
        return Bun.hash(data, 256).toString(16);
    }
    if (globalThis?.crypto?.subtle) {
        const buffer = await crypto.subtle.digest(algo, encoded);
        return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    const { createHash } = await import("node:crypto");
    return createHash(algo).update(encoded).digest("hex");
}

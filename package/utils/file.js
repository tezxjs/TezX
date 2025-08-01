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
            throw new Error("Unsupported runtime environment");
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
            throw new Error("Unsupported runtime environment");
    }
}
export async function fileSize(path) {
    switch (runtime) {
        case "node": {
            const { stat } = await import("node:fs/promises");
            return (await stat(path)).size;
        }
        case "bun": {
            return Bun.file(path).size;
        }
        case "deno": {
            return (await Deno.stat(path)).size;
        }
        default:
            return 0;
    }
}

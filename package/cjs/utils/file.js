"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExists = fileExists;
exports.getFileBuffer = getFileBuffer;
exports.readStream = readStream;
exports.fileSize = fileSize;
exports.etagDigest = etagDigest;
const error_js_1 = require("../core/error.js");
const runtime_js_1 = require("./runtime.js");
async function fileExists(path) {
    switch (runtime_js_1.runtime) {
        case "node": {
            const { access } = await Promise.resolve().then(() => __importStar(require("node:fs/promises")));
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
async function getFileBuffer(path) {
    switch (runtime_js_1.runtime) {
        case "node": {
            const { readFile } = await Promise.resolve().then(() => __importStar(require("node:fs/promises")));
            return readFile(path);
        }
        case "bun": {
            return new Uint8Array(await Bun.file(path).arrayBuffer());
        }
        case "deno":
            return Deno.readFile(path);
        default:
            throw new error_js_1.TezXError("Unsupported runtime environment");
    }
}
async function readStream(path) {
    switch (runtime_js_1.runtime) {
        case "node": {
            const { createReadStream } = await Promise.resolve().then(() => __importStar(require("node:fs")));
            const { Readable } = await Promise.resolve().then(() => __importStar(require("node:stream")));
            return Readable.toWeb(createReadStream(path));
        }
        case "bun": {
            return Bun.file(path).stream();
        }
        case "deno": {
            return (await Deno.open(path, { read: true })).readable;
        }
        default:
            throw new error_js_1.TezXError("Unsupported runtime environment");
    }
}
async function fileSize(path) {
    switch (runtime_js_1.runtime) {
        case "node": {
            const { stat } = await Promise.resolve().then(() => __importStar(require("node:fs/promises")));
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
            throw new error_js_1.TezXError("Unsupported runtime: " + runtime_js_1.runtime);
    }
}
async function etagDigest(algo = "MD5", data) {
    const encoded = typeof data === "string" ? new TextEncoder().encode(data) : data;
    if (runtime_js_1.runtime === "bun") {
        return Bun.hash(data, 256).toString(16);
    }
    if (globalThis?.crypto?.subtle) {
        const buffer = await crypto.subtle.digest(algo, encoded);
        return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    const { createHash } = await Promise.resolve().then(() => __importStar(require("node:crypto")));
    return createHash(algo).update(encoded).digest("hex");
}

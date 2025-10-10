export function base64Decode(base64) {
    const pad = base64.length % 4;
    if (pad)
        base64 += "=".repeat(4 - pad);
    if (typeof Buffer !== "undefined") {
        return Buffer.from(base64, "base64").toString("utf-8");
    }
    else if (typeof atob === "function") {
        return new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
    }
    else {
        throw new Error("Base64 decode not supported in this environment");
    }
}

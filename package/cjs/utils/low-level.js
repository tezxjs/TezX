"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHeaderKey = normalizeHeaderKey;
exports.extensionExtract = extensionExtract;
exports.sanitizePathSplitBasePath = sanitizePathSplitBasePath;
exports.sanitizePathSplit = sanitizePathSplit;
exports.sanitized = sanitized;
function normalizeHeaderKey(key) {
    let result = "";
    let upperNext = true;
    for (let i = 0; i < key.length; i++) {
        const ch = key.charCodeAt(i);
        if (ch === 45) {
            result += "-";
            upperNext = true;
        }
        else {
            result += upperNext
                ? String.fromCharCode(ch >= 97 && ch <= 122 ? ch - 32 : ch)
                : String.fromCharCode(ch >= 65 && ch <= 90 ? ch + 32 : ch);
            upperNext = false;
        }
    }
    return result;
}
function extensionExtract(filePath) {
    let lastDot = -1;
    for (let i = filePath.length - 1; i >= 0; i--) {
        if (filePath[i] === ".") {
            lastDot = i;
            break;
        }
    }
    if (lastDot === -1 || lastDot === filePath.length - 1)
        return "";
    let ext = "";
    for (let i = lastDot + 1; i < filePath.length; i++) {
        let c = filePath.charCodeAt(i);
        if (c >= 65 && c <= 90) {
            c += 32;
        }
        ext += String.fromCharCode(c);
    }
    return ext;
}
function sanitizePathSplitBasePath(basePath, path, out) {
    const combined = `${basePath}/${path}`;
    const parts = out ?? [];
    let segStart = 0;
    let i = 0;
    const len = combined.length;
    while (i < len) {
        const code = combined.charCodeAt(i);
        if (code === 47 || code === 92) {
            if (segStart < i) {
                const seg = combined.slice(segStart, i);
                if (seg !== "..")
                    parts.push(seg);
            }
            segStart = i + 1;
        }
        i++;
    }
    if (segStart < len) {
        const seg = combined.slice(segStart, len);
        if (seg !== "..")
            parts.push(seg);
    }
    return parts;
}
function sanitizePathSplit(path, out) {
    const parts = out ?? [];
    let segStart = 0;
    let i = 0;
    const len = path.length;
    while (i < len) {
        const code = path.charCodeAt(i);
        if (code === 47 || code === 92) {
            if (segStart < i) {
                const seg = path.slice(segStart, i);
                if (seg !== "..")
                    parts.push(seg);
            }
            segStart = i + 1;
        }
        i++;
    }
    if (segStart < len) {
        const seg = path.slice(segStart, len);
        if (seg !== "..")
            parts.push(seg);
    }
    return parts;
}
function sanitized(title) {
    const len = title.length;
    let result = "";
    let dash = false;
    for (let i = 0; i < len; i++) {
        let ch = title.charCodeAt(i);
        if (ch >= 65 && ch <= 90)
            ch += 32;
        if ((ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57) || ch === 46) {
            result += String.fromCharCode(ch);
            dash = false;
        }
        else if (ch === 32 || ch === 95 || ch === 45) {
            if (!dash && result.length > 0) {
                result += "-";
                dash = true;
            }
        }
    }
    return result.endsWith("-") ? result.slice(0, -1) : result;
}

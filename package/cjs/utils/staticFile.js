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
exports.defaultMimeType = exports.mimeTypes = void 0;
exports.getFiles = getFiles;
const environment_js_1 = require("../core/environment.js");
exports.mimeTypes = {
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "text/javascript",
    mjs: "text/javascript",
    json: "application/json",
    xml: "application/xml",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    rtf: "application/rtf",
    markdown: "text/markdown",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    ico: "image/x-icon",
    bmp: "image/bmp",
    tiff: "image/tiff",
    psd: "image/vnd.adobe.photoshop",
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    "3gp": "video/3gpp",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    flac: "audio/flac",
    m4a: "audio/mp4",
    mid: "audio/midi",
    midi: "audio/midi",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
    eot: "application/vnd.ms-fontobject",
    pdf: "application/pdf",
    odp: "application/vnd.oasis.opendocument.presentation",
    zip: "application/zip",
    gz: "application/gzip",
    tar: "application/x-tar",
    rar: "application/x-rar-compressed",
    _7z: "application/x-7z-compressed",
    bz2: "application/x-bzip2",
    "7z": "application/x-7z-compressed",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    odt: "application/vnd.oasis.opendocument.text",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    wasm: "application/wasm",
    map: "application/json",
    yaml: "application/yaml",
    yml: "application/yaml",
    proto: "text/plain",
    graphql: "application/graphql",
    pem: "application/x-pem-file",
    cer: "application/pkix-cert",
    crt: "application/x-x509-ca-cert",
    key: "application/x-pem-file",
    pfx: "application/x-pkcs12",
    glb: "model/gltf-binary",
    gltf: "model/gltf+json",
    obj: "model/obj",
    stl: "model/stl",
    usdz: "model/vnd.usdz+zip",
    exe: "application/x-msdownload",
    dmg: "application/x-apple-diskimage",
    deb: "application/x-debian-package",
    rpm: "application/x-redhat-package-manager",
    apk: "application/vnd.android.package-archive",
    webmanifest: "application/manifest+json",
    ics: "text/calendar",
    vcf: "text/vcard",
    warc: "application/warc",
    atom: "application/atom+xml",
    rss: "application/rss+xml",
    dll: "application/x-msdownload",
    sh: "application/x-sh",
    py: "text/x-python",
    rb: "text/x-ruby",
    pl: "text/x-perl",
    php: "application/x-httpd-php",
    torrent: "application/x-bittorrent",
    ipa: "application/vnd.iphone",
    eps: "application/postscript",
    ps: "application/postscript",
    ai: "application/postscript",
    swf: "application/x-shockwave-flash",
    jar: "application/java-archive",
    gcode: "text/x.gcode",
};
exports.defaultMimeType = "application/octet-stream";
async function getFiles(dir, basePath = "/", ref, option) {
    const files = [];
    const runtime = environment_js_1.Environment.getEnvironment;
    if (runtime == "deno") {
        for await (const entry of Deno.readDir(dir)) {
            const path = `${dir}/${entry.name}`;
            if (entry.isDirectory) {
                files.push(...(await getFiles(path, `${basePath}/${entry.name}`, ref, option)));
            }
            else {
                const x = `${basePath}/${entry.name}`;
                files.push({
                    file: path,
                    path: x.replace(/\\/g, "/"),
                });
            }
        }
    }
    else {
        const fs = await Promise.resolve().then(() => __importStar(require("node:fs/promises")));
        const path = await Promise.resolve().then(() => __importStar(require("node:path")));
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...(await getFiles(fullPath, `${basePath}/${entry.name}`, ref, option)));
            }
            else {
                const path = `${basePath}/${entry.name}`;
                files.push({
                    file: fullPath,
                    path: path.replace(/\\/g, "/"),
                });
            }
        }
    }
    files.forEach((r) => {
        ref.get(r.path, (ctx) => {
            if (option.cacheControl) {
                ctx.headers.set("Cache-Control", option.cacheControl);
            }
            if (option.headers) {
                for (const key in option.headers) {
                    let value = option.headers?.[key];
                    ctx.headers.set(key, value);
                }
            }
            return ctx.sendFile(r.file);
        });
    });
    return files;
}

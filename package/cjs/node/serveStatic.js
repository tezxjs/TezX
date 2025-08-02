"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveStatic = serveStatic;
exports.getFiles = getFiles;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const low_level_js_1 = require("../utils/low-level.js");
function serveStatic(...args) {
    let route = "";
    let dir;
    let options = {};
    switch (args.length) {
        case 3:
            [route, dir, options] = args;
            break;
        case 2:
            if (typeof args[1] === "object") {
                [dir, options] = args;
            }
            else {
                [route, dir] = args;
            }
            break;
        case 1:
            [dir] = args;
            break;
        default:
            throw new Error(`\x1b[1;31m404 Not Found\x1b[0m \x1b[1;32mInvalid arguments\x1b[0m`);
    }
    return {
        files: getFiles(dir, route, options),
        options,
    };
}
function getFiles(dir, basePath = "/", option = {}) {
    const files = [];
    const entries = (0, node_fs_1.readdirSync)(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = (0, node_path_1.join)(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getFiles(fullPath, `${basePath}/${entry.name}`, option));
        }
        else {
            const ext = (0, low_level_js_1.extensionExtract)(entry.name);
            if (option?.extensions?.length && !option.extensions.includes(ext)) {
                continue;
            }
            files.push({
                fileSource: fullPath,
                route: `/${(0, low_level_js_1.sanitizePathSplitBasePath)(basePath, entry.name).join("/")}`,
            });
        }
    }
    return files;
}

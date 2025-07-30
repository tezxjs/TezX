import { extensionExtract, sanitizePathSplitBasePath } from "../utils/low-level.js";
export function serveStatic(...args) {
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
        options
    };
}
export function getFiles(dir, basePath = "/", option = {}) {
    const files = [];
    for (const entry of Deno.readDirSync(dir)) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory) {
            files.push(...(getFiles(path, `${basePath}/${entry.name}`, option)));
        }
        else {
            const ext = extensionExtract(entry.name);
            if (option?.extensions?.length && !option.extensions.includes(ext)) {
                continue;
            }
            files.push({
                fileSource: path,
                route: `/${sanitizePathSplitBasePath(basePath, entry.name).join("/")}`
            });
        }
    }
    return files;
}

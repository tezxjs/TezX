import { readdirSync } from "node:fs";
import { join } from "node:path";

import { ServeStatic, StaticFileArray, StaticServeOption } from "../types/index.js";
import { extensionExtract, } from "../utils/utils.js";
import { sanitizePathSplitBasePath } from "../utils/url.js";

/**
 * Registers static files for serving from a folder, optionally under a specific route.
 *
 * There are two usage patterns:
 *
 * 1. `serveStatic(route: string, folder: string, option?: StaticServeOption)`
 *    - Serves files in `folder` under the given `route`.
 *    - Example: `serveStatic("/assets", "./public/assets")`
 *
 * 2. `serveStatic(folder: string, option?: StaticServeOption)`
 *    - Serves files in `folder` under its own route (e.g., `./public` -> `/public`)
 *    - Example: `serveStatic("./public")`
 *
 * @param args - Either [route, folder, option] or [folder, option]
 * @returns A list of static files and their associated route paths.
 */

/**
 * Universal ETag generator for Deno, Bun, and Node.js environments.
 * Uses file size + modification time (mtimeMs) to create a unique hash-based ETag.
 *
 * @example
 * const etag = await getETag("/path/to/file.txt");
 * ctx.setHeader("ETag", etag);
 */

export function serveStatic(
  route: string,
  folder: string,
  option?: StaticServeOption,
): ServeStatic;
export function serveStatic(
  folder: string,
  option?: StaticServeOption,
): ServeStatic;
export function serveStatic(
  ...args: [string, string, StaticServeOption?] | [string, StaticServeOption?]
): ServeStatic {
  let route: string = "";
  let dir: any;
  let options: any = {};

  switch (args.length) {
    case 3:
      [route, dir, options] = args;
      break;
    case 2:
      if (typeof args[1] === "object") {
        [dir, options] = args;
      } else {
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

/**
 * Recursively collects files from a directory, applying filters.
 *
 * @param dir - Directory to search.
 * @param basePath - Route base path for constructing public paths.
 * @param option - Options including extensions filter.
 * @returns Array of file objects with file system and public paths.
 */
function getFiles(
  dir: string,
  basePath: string = "/",
  option: StaticServeOption = {},
): StaticFileArray {
  const files: StaticFileArray = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, `${basePath}/${entry.name}`, option));
    } else {
      const ext = extensionExtract(entry.name);

      if (option?.extensions?.length && !option.extensions.includes(ext)) {
        continue;
      }

      files.push({
        fileSource: fullPath,
        route: `/${sanitizePathSplitBasePath(basePath, entry.name).join("/")}`,
      });
    }
  }

  return files;
}
export default serveStatic;
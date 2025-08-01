import { ServeStatic, StaticFileArray, StaticServeOption } from "../types/index.js";
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
export declare function serveStatic(route: string, folder: string, option?: StaticServeOption): ServeStatic;
export declare function serveStatic(folder: string, option?: StaticServeOption): ServeStatic;
/**
 * Recursively collects files from a directory, applying filters.
 *
 * @param dir - Directory to search.
 * @param basePath - Route base path for constructing public paths.
 * @param option - Options including extensions filter.
 * @returns Array of file objects with file system and public paths.
 */
export declare function getFiles(dir: string, basePath?: string, option?: StaticServeOption): StaticFileArray;

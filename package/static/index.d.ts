import { ServeStatic, StaticServeOption } from "../types/index.js";
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
export declare function serveStatic(route: string, folder: string, option?: StaticServeOption): ServeStatic;
export declare function serveStatic(folder: string, option?: StaticServeOption): ServeStatic;
export default serveStatic;

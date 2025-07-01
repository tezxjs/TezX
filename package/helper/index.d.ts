import { Environment } from "../core/environment.js";
import { sanitizePathSplit } from "../utils/url.js";
import { generateID } from "./common.js";
export { GlobalConfig } from "../core/config.js";
export type { AdapterType } from "../core/config.js";
export { Environment } from "../core/environment.js";
export { sanitizePathSplit } from "../utils/url.js";
export type { UrlRef } from "../utils/url.js";
export { generateID } from "./common.js";
declare const _default: {
    Environment: typeof Environment;
    GlobalConfig: {
        new (): {};
        notFound: import("../index.js").Callback;
        onError: <T extends Record<string, any> = {}>(err: string, ctx: import("../index.js").Context<T>) => Response;
        allowDuplicateMw?: boolean;
        overwriteMethod?: boolean;
        debugMode?: boolean;
        server: any;
        adapter: import("../core/config.js").AdapterType;
        readonly debugging: {
            info: (msg: string, ...args: unknown[]) => void;
            warn: (msg: string, ...args: unknown[]) => void;
            error: (msg: string, ...args: unknown[]) => void;
            debug: (msg: string, ...args: unknown[]) => void;
            success: (msg: string, ...args: unknown[]) => void;
        };
    };
    sanitizePathSplit: typeof sanitizePathSplit;
    generateID: typeof generateID;
};
export default _default;

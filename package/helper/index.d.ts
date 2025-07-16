import { GlobalConfig } from "../core/config.js";
import { Environment } from "../core/environment.js";
import { colorText } from "../utils/colors.js";
import { sanitizePathSplit } from "../utils/url.js";
import { generateID } from "./common.js";
export type { AdapterType } from "../types/index.js";
export type { UrlRef } from "../utils/url.js";
export { colorText, Environment, generateID, GlobalConfig, sanitizePathSplit };
declare const _default: {
    Environment: typeof Environment;
    colorText: typeof colorText;
    GlobalConfig: {
        new (): {};
        notFound: import("../types/index.js").Callback;
        onError: <T extends Record<string, any> = {}>(err: string, ctx: import("../types/index.js").ctx<T>) => Response;
        allowDuplicateMw?: boolean;
        overwriteMethod?: boolean;
        debugMode?: boolean;
        server: any;
        adapter: import("../types/index.js").AdapterType;
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

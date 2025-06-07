import { AdapterType } from "../adapter/index.js";
import { Callback, ctx } from "./router.js";
export declare let GlobalConfig: {
    new (): {};
    notFound: Callback;
    onError: <T extends Record<string, any> = {}>(err: string, ctx: ctx<T>) => Response;
    allowDuplicateMw?: boolean;
    overwriteMethod?: boolean;
    debugMode?: boolean;
    server: any;
    adapter: AdapterType;
    readonly debugging: {
        info: (msg: string, ...args: unknown[]) => void;
        warn: (msg: string, ...args: unknown[]) => void;
        error: (msg: string, ...args: unknown[]) => void;
        debug: (msg: string, ...args: unknown[]) => void;
        success: (msg: string, ...args: unknown[]) => void;
    };
};

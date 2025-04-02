import { Callback, ctx } from "../router";
export declare let GlobalConfig: {
    new (): {};
    notFound: Callback;
    onError: <T extends Record<string, any> = {}>(err: string, ctx: ctx<T>) => any;
    allowDuplicateMw?: boolean;
    overwriteMethod?: boolean;
    debugMode?: boolean;
    readonly debugging: {
        info: (msg: string, ...args: unknown[]) => void;
        warn: (msg: string, ...args: unknown[]) => void;
        error: (msg: string, ...args: unknown[]) => void;
        debug: (msg: string, ...args: unknown[]) => void;
        success: (msg: string, ...args: unknown[]) => void;
    };
};

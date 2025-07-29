import { Runtime } from "../types/index.js";
export declare let GlobalConfig: {
    new (): {};
    debugMode?: boolean;
    server: any;
    adapter: Runtime;
    readonly debugging: {
        info: (msg: string, ...args: unknown[]) => void;
        warn: (msg: string, ...args: unknown[]) => void;
        error: (msg: string, ...args: unknown[]) => void;
        debug: (msg: string, ...args: unknown[]) => void;
        success: (msg: string, ...args: unknown[]) => void;
    };
};

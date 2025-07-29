import { loggerOutput } from "../utils/debugging.js";
import { runtime } from "../utils/runtime.js";
export let GlobalConfig = class {
    static debugMode = false;
    static server;
    static adapter = runtime;
    static get debugging() {
        return this.debugMode
            ? {
                info: (msg, ...args) => loggerOutput("info", msg, ...args),
                warn: (msg, ...args) => loggerOutput("warn", msg, ...args),
                error: (msg, ...args) => loggerOutput("error", msg, ...args),
                debug: (msg, ...args) => loggerOutput("debug", msg, ...args),
                success: (msg, ...args) => loggerOutput("success", msg, ...args),
            }
            : {
                info: (msg, ...args) => { },
                warn: (msg, ...args) => { },
                error: (msg, ...args) => { },
                debug: (msg, ...args) => { },
                success: (msg, ...args) => { },
            };
    }
};

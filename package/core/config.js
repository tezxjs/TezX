import { loggerOutput } from "../utils/debugging.js";
import { EnvironmentDetector } from "./environment.js";
export let GlobalConfig = class {
    static notFound = (ctx) => {
        const { method, urlRef: { pathname }, } = ctx.req;
        return ctx.text(`${method}: '${pathname}' could not find\n`, 404);
    };
    static onError = (err, ctx) => {
        return ctx.text(err, 500);
    };
    static allowDuplicateMw = false;
    static overwriteMethod = true;
    static debugMode = false;
    static server;
    static adapter = EnvironmentDetector.getEnvironment;
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

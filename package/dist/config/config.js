var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var _a;
import { loggerOutput } from "../utils/debugging";
export let GlobalConfig = (_a = class {
        static get debugging() {
            return this.debugMode ? {
                info: (msg, ...args) => loggerOutput("info", msg, ...args),
                warn: (msg, ...args) => loggerOutput("warn", msg, ...args),
                error: (msg, ...args) => loggerOutput("error", msg, ...args),
                debug: (msg, ...args) => loggerOutput("debug", msg, ...args),
                success: (msg, ...args) => loggerOutput("success", msg, ...args),
            } : {
                info: (msg, ...args) => { },
                warn: (msg, ...args) => { },
                error: (msg, ...args) => { },
                debug: (msg, ...args) => { },
                success: (msg, ...args) => { }
            };
        }
    },
    __setFunctionName(_a, "GlobalConfig"),
    _a.notFound = (ctx) => {
        const { method, urlRef: { pathname }, } = ctx.req;
        return ctx.text(`${method}: '${pathname}' could not find\n`, 404);
    },
    _a.onError = (err, ctx) => {
        return ctx.text(err, 500);
    },
    _a.allowDuplicateMw = false,
    _a.overwriteMethod = true,
    _a.debugMode = false,
    _a);

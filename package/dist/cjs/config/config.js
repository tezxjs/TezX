"use strict";
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalConfig = void 0;
const debugging_1 = require("../utils/debugging");
exports.GlobalConfig = (_a = class {
        static get debugging() {
            return this.debugMode
                ? {
                    info: (msg, ...args) => (0, debugging_1.loggerOutput)("info", msg, ...args),
                    warn: (msg, ...args) => (0, debugging_1.loggerOutput)("warn", msg, ...args),
                    error: (msg, ...args) => (0, debugging_1.loggerOutput)("error", msg, ...args),
                    debug: (msg, ...args) => (0, debugging_1.loggerOutput)("debug", msg, ...args),
                    success: (msg, ...args) => (0, debugging_1.loggerOutput)("success", msg, ...args),
                }
                : {
                    info: (msg, ...args) => { },
                    warn: (msg, ...args) => { },
                    error: (msg, ...args) => { },
                    debug: (msg, ...args) => { },
                    success: (msg, ...args) => { },
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

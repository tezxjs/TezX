"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalConfig = void 0;
const debugging_js_1 = require("../utils/debugging.js");
const runtime_js_1 = require("../utils/runtime.js");
let GlobalConfig = class {
    static debugMode = false;
    static server;
    static adapter = runtime_js_1.runtime;
    static get debugging() {
        return this.debugMode
            ? {
                info: (msg, ...args) => (0, debugging_js_1.loggerOutput)("info", msg, ...args),
                warn: (msg, ...args) => (0, debugging_js_1.loggerOutput)("warn", msg, ...args),
                error: (msg, ...args) => (0, debugging_js_1.loggerOutput)("error", msg, ...args),
                debug: (msg, ...args) => (0, debugging_js_1.loggerOutput)("debug", msg, ...args),
                success: (msg, ...args) => (0, debugging_js_1.loggerOutput)("success", msg, ...args),
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
exports.GlobalConfig = GlobalConfig;

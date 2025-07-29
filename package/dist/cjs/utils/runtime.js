"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtime = exports.Environment = void 0;
class Environment {
    static get getEnvironment() {
        if (typeof Bun !== "undefined")
            return "bun";
        if (typeof Deno !== "undefined")
            return "deno";
        if (typeof process !== "undefined" && process.versions?.node)
            return "node";
        return "unknown";
    }
}
exports.Environment = Environment;
exports.runtime = Environment.getEnvironment;

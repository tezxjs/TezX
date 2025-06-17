"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentDetector = void 0;
class EnvironmentDetector {
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
exports.EnvironmentDetector = EnvironmentDetector;

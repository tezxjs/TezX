"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentDetector = void 0;
class EnvironmentDetector {
  static get getEnvironment() {
    if (typeof Bun !== "undefined") return "bun";
    if (typeof Deno !== "undefined") return "deno";
    if (typeof process !== "undefined" && process.versions?.node) return "node";
    return "unknown";
  }
  static getHost(headers) {
    try {
      return headers?.get("host") || "unknown";
    } catch (error) {
      throw new Error("Failed to get host.");
    }
  }
}
exports.EnvironmentDetector = EnvironmentDetector;

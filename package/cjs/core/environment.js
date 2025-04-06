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
  static detectProtocol(req) {
    try {
      if (this.getEnvironment === "node") {
        return req?.socket?.encrypted ? "https" : "http";
      }
      return "unknown";
    } catch (error) {
      throw new Error("Failed to detect protocol.");
    }
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

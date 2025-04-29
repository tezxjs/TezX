import { HeadersParser } from "./header.js";
export declare class EnvironmentDetector {
  static get getEnvironment(): "node" | "bun" | "deno" | "unknown";
  static getHost(headers: HeadersParser): string;
}

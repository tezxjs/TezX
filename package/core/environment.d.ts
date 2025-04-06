import { HeadersParser } from "./header";
export declare class EnvironmentDetector {
  static get getEnvironment(): "node" | "bun" | "deno" | "unknown";
  static detectProtocol(req: any): "unknown" | "http" | "https";
  static getHost(headers: HeadersParser): string;
}

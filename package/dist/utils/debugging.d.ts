export type LogLevel = "info" | "warn" | "error" | "debug" | "success";
export declare const loggerOutput: (level: LogLevel, message: string, ...args: unknown[]) => void;

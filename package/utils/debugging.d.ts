export type LogLevel = "info" | "warn" | "error" | "debug" | "success";
export declare const loggerOutput: (level: LogLevel, message: string, ...args: unknown[]) => void;
/**
 * A universal logger function that measures and logs the processing time of an operation.
 * @param label - A label to identify the operation being logged.
 * @param callback - The operation to measure and execute.
 */

import { COLORS } from "./colors.js";

export type LogLevel = "info" | "warn" | "error" | "debug" | "success";

export const loggerOutput = (level: LogLevel, message: string, ...args: unknown[]) => {
  const LEVEL_COLORS: Record<LogLevel, string> = {
    info: COLORS.blue,
    warn: COLORS.yellow,
    error: COLORS.red,
    debug: COLORS.cyan,
    success: COLORS.green,
  };

  const levelText = `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${COLORS.reset}`;
  console.log(` ${levelText} ${message}`, ...args?.flat());
};

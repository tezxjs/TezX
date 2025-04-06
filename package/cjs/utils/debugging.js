"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerOutput = void 0;
const colors_1 = require("./colors");
const loggerOutput = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const LEVEL_COLORS = {
    info: colors_1.COLORS.blue,
    warn: colors_1.COLORS.yellow,
    error: colors_1.COLORS.red,
    debug: colors_1.COLORS.cyan,
    success: colors_1.COLORS.green,
  };
  const levelText = `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${colors_1.COLORS.reset}`;
  console.log(` ${levelText} ${message}`, ...args?.flat());
};
exports.loggerOutput = loggerOutput;

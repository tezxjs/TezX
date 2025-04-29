"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerOutput = void 0;
const colors_js_1 = require("./colors.js");
const loggerOutput = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const LEVEL_COLORS = {
    info: colors_js_1.COLORS.blue,
    warn: colors_js_1.COLORS.yellow,
    error: colors_js_1.COLORS.red,
    debug: colors_js_1.COLORS.cyan,
    success: colors_js_1.COLORS.green,
  };
  const levelText = `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${colors_js_1.COLORS.reset}`;
  console.log(` ${levelText} ${message}`, ...args?.flat());
};
exports.loggerOutput = loggerOutput;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonHandler = void 0;
const config_js_1 = require("./config.js");
class CommonHandler {
  notFound(callback) {
    config_js_1.GlobalConfig.notFound = callback;
    return this;
  }
  onError(callback) {
    config_js_1.GlobalConfig.onError = callback;
    return this;
  }
}
exports.CommonHandler = CommonHandler;

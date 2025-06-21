"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectBot = void 0;
const basicAuth_js_1 = require("./basicAuth.js");
const cacheControl_js_1 = require("./cacheControl.js");
const cors_js_1 = require("./cors.js");
const detectBot_js_1 = require("./detectBot.js");
const detectLocale_js_1 = require("./detectLocale.js");
const i18n_js_1 = require("./i18n.js");
const lazyLoadModules_js_1 = require("./lazyLoadModules.js");
const logger_js_1 = require("./logger.js");
const pagination_js_1 = require("./pagination.js");
const powered_by_js_1 = require("./powered-by.js");
const rateLimiter_js_1 = require("./rateLimiter.js");
const request_id_js_1 = require("./request-id.js");
const requestTimeout_js_1 = require("./requestTimeout.js");
const sanitizeHeader_js_1 = require("./sanitizeHeader.js");
const secureHeaders_js_1 = require("./secureHeaders.js");
const xssProtection_js_1 = require("./xssProtection.js");
__exportStar(require("./basicAuth.js"), exports);
__exportStar(require("./cacheControl.js"), exports);
__exportStar(require("./cors.js"), exports);
var detectBot_js_2 = require("./detectBot.js");
Object.defineProperty(exports, "detectBot", { enumerable: true, get: function () { return detectBot_js_2.detectBot; } });
__exportStar(require("./detectLocale.js"), exports);
__exportStar(require("./i18n.js"), exports);
__exportStar(require("./lazyLoadModules.js"), exports);
__exportStar(require("./logger.js"), exports);
__exportStar(require("./pagination.js"), exports);
__exportStar(require("./powered-by.js"), exports);
__exportStar(require("./rateLimiter.js"), exports);
__exportStar(require("./request-id.js"), exports);
__exportStar(require("./requestTimeout.js"), exports);
__exportStar(require("./sanitizeHeader.js"), exports);
__exportStar(require("./secureHeaders.js"), exports);
__exportStar(require("./xssProtection.js"), exports);
exports.default = {
    basicAuth: basicAuth_js_1.basicAuth,
    cacheControl: cacheControl_js_1.cacheControl,
    cors: cors_js_1.cors,
    detectBot: detectBot_js_1.detectBot,
    detectLocale: detectLocale_js_1.detectLocale,
    i18n: i18n_js_1.i18n,
    lazyLoadModules: lazyLoadModules_js_1.lazyLoadModules,
    logger: logger_js_1.logger,
    paginationHandler: pagination_js_1.paginationHandler,
    poweredBy: powered_by_js_1.poweredBy,
    rateLimiter: rateLimiter_js_1.rateLimiter,
    requestID: request_id_js_1.requestID,
    requestTimeout: requestTimeout_js_1.requestTimeout,
    sanitizeHeaders: sanitizeHeader_js_1.sanitizeHeaders,
    secureHeaders: secureHeaders_js_1.secureHeaders,
    xssProtection: xssProtection_js_1.xssProtection,
};

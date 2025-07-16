"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.TezX = exports.Router = exports.regexMatchRoute = exports.compileRegexRoute = void 0;
const router_js_1 = require("./core/router.js");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_js_1.Router; } });
const server_js_1 = require("./core/server.js");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_js_1.TezX; } });
const regexRouter_js_1 = require("./utils/regexRouter.js");
Object.defineProperty(exports, "compileRegexRoute", { enumerable: true, get: function () { return regexRouter_js_1.compileRegexRoute; } });
Object.defineProperty(exports, "regexMatchRoute", { enumerable: true, get: function () { return regexRouter_js_1.regexMatchRoute; } });
exports.version = "2.0.11";
exports.default = {
    Router: router_js_1.Router,
    regexMatchRoute: regexRouter_js_1.regexMatchRoute,
    compileRegexRoute: regexRouter_js_1.compileRegexRoute,
    TezX: server_js_1.TezX,
    version: exports.version,
};

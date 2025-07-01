"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.compileRegexRoute = exports.regexMatchRoute = exports.TezX = exports.Router = void 0;
const router_js_1 = require("./core/router.js");
const server_js_1 = require("./core/server.js");
const regexRouter_js_1 = require("./utils/regexRouter.js");
Object.defineProperty(exports, "regexMatchRoute", { enumerable: true, get: function () { return regexRouter_js_1.regexMatchRoute; } });
Object.defineProperty(exports, "compileRegexRoute", { enumerable: true, get: function () { return regexRouter_js_1.compileRegexRoute; } });
var router_js_2 = require("./core/router.js");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_js_2.Router; } });
var server_js_2 = require("./core/server.js");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_js_2.TezX; } });
exports.version = "2.0.7-beta";
exports.default = {
    Router: router_js_1.Router,
    regexMatchRoute: regexRouter_js_1.regexMatchRoute, compileRegexRoute: regexRouter_js_1.compileRegexRoute,
    TezX: server_js_1.TezX,
    version: exports.version,
};

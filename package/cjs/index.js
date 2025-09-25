"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.TezXError = exports.TezX = exports.Router = void 0;
const error_js_1 = require("./core/error.js");
Object.defineProperty(exports, "TezXError", { enumerable: true, get: function () { return error_js_1.TezXError; } });
const router_js_1 = require("./core/router.js");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_js_1.Router; } });
const server_js_1 = require("./core/server.js");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_js_1.TezX; } });
exports.version = "3.0.12-beta";
exports.default = {
    Router: router_js_1.Router,
    TezX: server_js_1.TezX,
    version: exports.version,
    TezXError: error_js_1.TezXError,
};

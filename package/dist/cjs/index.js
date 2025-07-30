"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.TezX = exports.Router = void 0;
const router_js_1 = require("./core/router.js");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_js_1.Router; } });
const server_js_1 = require("./core/server.js");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_js_1.TezX; } });
exports.version = "3.0.1-beta";
exports.default = {
    Router: router_js_1.Router,
    TezX: server_js_1.TezX,
    version: exports.version,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.useParams = exports.TezX = exports.Router = void 0;
const express_1 = require("express");
const server_js_1 = require("./core/server.js");
const params_js_1 = require("./utils/params.js");
Object.defineProperty(exports, "useParams", { enumerable: true, get: function () { return params_js_1.useParams; } });
var router_js_1 = require("./core/router.js");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_js_1.Router; } });
var server_js_2 = require("./core/server.js");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_js_2.TezX; } });
exports.version = "2.0.5";
exports.default = {
    Router: express_1.Router,
    TezX: server_js_1.TezX,
    useParams: params_js_1.useParams,
    version: exports.version,
};

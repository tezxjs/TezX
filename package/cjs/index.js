"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.useParams = exports.TezX = exports.Router = void 0;
var router_1 = require("./core/router");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_1.Router; } });
var server_1 = require("./core/server");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_1.TezX; } });
var params_1 = require("./utils/params");
Object.defineProperty(exports, "useParams", { enumerable: true, get: function () { return params_1.useParams; } });
exports.version = "1.0.30";

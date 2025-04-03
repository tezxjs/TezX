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
exports.version = exports.useParams = exports.TezX = exports.Router = void 0;
__exportStar(require("./adapter"), exports);
var router_1 = require("./router");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_1.Router; } });
var server_1 = require("./server");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_1.TezX; } });
var params_1 = require("./utils/params");
Object.defineProperty(exports, "useParams", { enumerable: true, get: function () { return params_1.useParams; } });
exports.version = "1.0.7";

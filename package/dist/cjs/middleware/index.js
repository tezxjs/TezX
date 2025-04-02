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
exports.cors = void 0;
var cors_1 = require("./cors");
Object.defineProperty(exports, "cors", { enumerable: true, get: function () { return cors_1.cors; } });
__exportStar(require("./logger"), exports);
__exportStar(require("./powered-by"), exports);
__exportStar(require("./request-id"), exports);
__exportStar(require("./secureHeaders"), exports);
__exportStar(require("./xssProtection"), exports);

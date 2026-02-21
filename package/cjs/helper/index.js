"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = exports.generateRandomBase64 = exports.generateID = exports.useFormData = void 0;
exports.getConnInfo = getConnInfo;
const formData_js_1 = require("./formData.js");
Object.defineProperty(exports, "useFormData", { enumerable: true, get: function () { return formData_js_1.useFormData; } });
const generateID_js_1 = require("./generateID.js");
Object.defineProperty(exports, "generateID", { enumerable: true, get: function () { return generateID_js_1.generateID; } });
Object.defineProperty(exports, "generateRandomBase64", { enumerable: true, get: function () { return generateID_js_1.generateRandomBase64; } });
Object.defineProperty(exports, "generateUUID", { enumerable: true, get: function () { return generateID_js_1.generateUUID; } });
exports.default = {
    useFormData: formData_js_1.useFormData,
    generateID: generateID_js_1.generateID, generateRandomBase64: generateID_js_1.generateRandomBase64, generateUUID: generateID_js_1.generateUUID
};
function getConnInfo(ctx) {
    return ctx?.server?.requestIP?.(ctx.rawRequest);
}

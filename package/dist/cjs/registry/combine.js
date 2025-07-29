"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombineRouteRegistry = void 0;
const formData_js_1 = require("../utils/formData.js");
class CombineRouteRegistry {
    name;
    root = { prefix: "", staticChildren: new Map() };
    x;
    constructor() {
        this.name = 'combine';
    }
    createNode(prefix) {
        return { prefix, staticChildren: new Map() };
    }
    addMiddleware(path, middleware) {
    }
    addRoute(method, path, handler) {
        console.log(path);
        this.x = handler;
    }
    search(method, path) {
        return {
            method,
            middlewares: [],
            handlers: [
                async (ctx, next) => {
                    try {
                        const x = (await (0, formData_js_1.useFormData)(ctx, {
                            maxFiles: 3
                        }));
                        x.fsd;
                    }
                    catch (err) {
                        console.log(err);
                    }
                    return ctx.text("Rakib");
                },
            ],
            params: { test: '345' }
        };
    }
}
exports.CombineRouteRegistry = CombineRouteRegistry;

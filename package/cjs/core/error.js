"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezXError = void 0;
class TezXError extends Error {
    statusCode;
    details;
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = "Bad Request", details) {
        return new TezXError(message, 400, details);
    }
    static unauthorized(message = "Unauthorized", details) {
        return new TezXError(message, 401, details);
    }
    static forbidden(message = "Forbidden", details) {
        return new TezXError(message, 403, details);
    }
    static notFound(message = "Resource Not Found", details) {
        return new TezXError(message, 404, details);
    }
    static conflict(message = "Conflict", details) {
        return new TezXError(message, 409, details);
    }
    static internal(message = "Internal Server Error", details) {
        return new TezXError(message, 500, details);
    }
    toJSON() {
        return {
            error: true,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details ?? null,
        };
    }
}
exports.TezXError = TezXError;

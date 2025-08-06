"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ErrorHandler class is Derived From Error
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ErrorHandler;

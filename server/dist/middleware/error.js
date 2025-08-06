"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const ErrorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error!";
    //wrong mongoDB id error
    if (err.name === "CastError") {
        const message = `Resources not Found with this id .. Invalid ${err.path}`;
        err = new ErrorHandler_1.default(message, 400);
    }
    //Duplicate key Error
    if (err.code === 11000) {
        const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler_1.default(message, 409);
    }
    //wrong jwt error
    if (err.name === "JsonWebTokenError") {
        const message = `Your Url is invalid!,Please try again Later `;
        err = new ErrorHandler_1.default(message, 401);
    }
    //jwt token expired
    if (err.name === "TokenExpiredError") {
        const message = `Your Url is Expired!\nPlease try again Later `;
        err = new ErrorHandler_1.default(message, 401);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.ErrorMiddleware = ErrorMiddleware;

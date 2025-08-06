"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = exports.refreshtokenExpiresIn = exports.accesstokenExpiresIn = void 0;
require("dotenv").config();
const redis_1 = require("./redis");
//parse enviroment variables  with fallback values
exports.accesstokenExpiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10);
exports.refreshtokenExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10);
//options for cookies
exports.accessTokenOptions = {
    expires: new Date(Date.now() + exports.accesstokenExpiresIn * 60 * 60 * 1000),
    maxAge: exports.accesstokenExpiresIn * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + exports.refreshtokenExpiresIn * 24 * 60 * 60 * 1000),
    maxAge: exports.refreshtokenExpiresIn * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
const sendToken = (user, statusCode, res) => {
    const access_token = user.SignAccessToken();
    const refresh_token = user.SignRefreshToken();
    //Upload session to (cashe) redis
    redis_1.redis.set(user._id, JSON.stringify(user));
    //only set secure to true in production
    if (process.env.NODE_ENV === "production") {
        exports.accessTokenOptions.secure = true;
    }
    res.cookie("access_token", access_token, exports.accessTokenOptions);
    res.cookie("refresh_token", refresh_token, exports.refreshTokenOptions);
    res.status(statusCode).json({
        success: true,
        user,
        access_token,
    });
};
exports.sendToken = sendToken;

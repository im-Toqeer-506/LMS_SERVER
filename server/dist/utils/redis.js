"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
require('dotenv').config();
const redisClent = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redius Conncted to ${process.env.REDIS_URL}`);
        return process.env.REDIS_URL;
    }
    throw new Error('Redis Connection Faild');
};
exports.redis = new ioredis_1.Redis(redisClent());

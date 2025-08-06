"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const SocketServer_1 = require("./SocketServer");
const db_1 = __importDefault(require("./utils/db"));
const cloudinary_1 = require("cloudinary");
const http_1 = __importDefault(require("http"));
require("dotenv").config();
//recall:Socket ->Runs on top of the HTTP(S) server
const server = http_1.default.createServer(app_1.app);
//cloudinary config
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
//connection for socket
(0, SocketServer_1.initSocketServer)(server);
server.listen(process.env.PORT, () => {
    console.log(`Server is connected on the PORT:${process.env.PORT}`);
    (0, db_1.default)();
});

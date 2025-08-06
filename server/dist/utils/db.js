"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const dbURl = process.env.MONOGODB_URI || "";
const dbConnection = async () => {
    try {
        await mongoose_1.default.connect(`${dbURl}`).then((data) => {
            console.log(`MongoDB connected successfully: ${data.connection.host}`);
        });
    }
    catch (error) {
        console.error("Error", error);
        setTimeout(dbConnection, 5000);
    }
};
exports.default = dbConnection;

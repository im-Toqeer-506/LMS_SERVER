require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";
interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}
 //parse enviroment variables  with fallback values
  export const accesstokenExpiresIn = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || "300",
    10
  );
 export const refreshtokenExpiresIn = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || "1200",
    10
  );
const isProduction = process.env.NODE_ENV === "production";

export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accesstokenExpiresIn * 60 * 60 * 1000),
  maxAge: accesstokenExpiresIn * 60 * 60 * 1000,
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshtokenExpiresIn * 24 * 60 * 60 * 1000),
  maxAge: refreshtokenExpiresIn * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

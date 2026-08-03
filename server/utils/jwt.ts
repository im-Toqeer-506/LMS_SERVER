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

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const access_token = user.SignAccessToken();
  const refresh_token = // client IP (X-Forwarded-For) instead of the proxy's.
user.SignRefreshToken();
  //Upload session to (cashe) redis
  redis.set(user._id, JSON.stringify(user) as any);
   //only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }
  res.cookie("access_token", access_token, accessTokenOptions);
  res.cookie("refresh_token", refresh_token, refreshTokenOptions);
  res.status(statusCode).json({
    success: true,
    user,
    access_token,
  });
};
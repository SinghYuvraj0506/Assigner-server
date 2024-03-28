import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(
  async (req: Request | any, _ , next: NextFunction) => {
    try {
      const accessToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!accessToken) {
        throw new ApiError(401, "Unauthorized Access!!!");
      }

      let decodedInfo: JwtPayload | string;
      if (process.env.ACCESS_TOKEN_SECRET) {
        decodedInfo = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      } else {
        throw new ApiError(401, "Something went wrong in authorizing");
      }

      let user;

      if(typeof decodedInfo !== "string"){
        user = await User.findById(decodedInfo?.id).select(
          "-password -refreshToken"
        );
      }

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }
      else if(user.status !== 1){
        throw new ApiError(401, "User not allowed");
      }
      
      req.user = user;
      next();
    } catch (error:any) {
      throw new ApiError(401, error?.message || "Invalid Access Token");
    }
  }
);

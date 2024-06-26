import { Request, NextFunction, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt, { Secret } from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(
  async (req: Request | any, _, next: NextFunction) => {
    try {
      const accessToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!accessToken) {
        throw new ApiError(401, "Unauthorized Access!!!");
      }

      let decodedInfo = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as Secret
      );

      let user;

      if (typeof decodedInfo !== "string") {
        user = await User.findById(decodedInfo?.id).select(
          "-password -refreshToken -__v -createdAt -updatedAt"
        );
      }

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      } else if (user.status !== 1) {
        throw new ApiError(401, "User not allowed");
      }

      req.user = user;
      next();
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid Access Token");
    }
  }
);

export const ensureGuest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    try {
      jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as Secret
      );

      // User is authenticated, redirect to another route (e.g., home page)
      return res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
      return next();
    }

  }
);

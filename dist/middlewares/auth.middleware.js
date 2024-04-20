var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJWT = asyncHandler((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const accessToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) ||
            ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Access!!!");
        }
        let decodedInfo = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        let user;
        if (typeof decodedInfo !== "string") {
            user = yield User.findById(decodedInfo === null || decodedInfo === void 0 ? void 0 : decodedInfo.id).select("-password -refreshToken -__v -createdAt -updatedAt");
        }
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        else if (user.status !== 1) {
            throw new ApiError(401, "User not allowed");
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Invalid Access Token");
    }
}));
export const ensureGuest = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const accessToken = ((_c = req.cookies) === null || _c === void 0 ? void 0 : _c.accessToken) ||
        ((_d = req.header("Authorization")) === null || _d === void 0 ? void 0 : _d.replace("Bearer ", ""));
    if (!accessToken) {
        // User is not authenticated, proceed to next middleware
        return next();
    }
    // User is authenticated, redirect to another route (e.g., home page)
    res.redirect(process.env.CLIENT_URL);
}));

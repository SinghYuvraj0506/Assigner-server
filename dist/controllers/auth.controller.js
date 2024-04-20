import passport from "passport";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
export const openGoogleAuth = asyncHandler((req, res, next) => {
    passport.authenticate("google", { scope: ["email", "profile"] })(req, res, next);
});
export const GoogleCallback = asyncHandler((req, res, next) => {
    passport.authenticate("google", {
        successRedirect: process.env.CLIENT_URL + "/login/check",
        failureRedirect: "/auth/google/failure",
    })(req, res, next);
});
export const SuccessLoginHanlder = asyncHandler((req, res, next) => {
    var _a;
    if (req.user) {
        const { name, picture, email, email_verified } = (_a = req.user) === null || _a === void 0 ? void 0 : _a._json;
        const userData = {
            name,
            picture,
            email,
            email_verified,
            signInFrom: "google"
        };
        req.user = {};
        return res
            .status(200)
            .json(new ApiResponse(200, userData, "Recieved User Data"));
    }
    else {
        throw new ApiError(400, "User data not found!!!!");
    }
});
export const FailureLoginHanlder = asyncHandler((req, res, next) => {
    var _a;
    return res.redirect((_a = process.env.CLIENT_URL) !== null && _a !== void 0 ? _a : "/");
});

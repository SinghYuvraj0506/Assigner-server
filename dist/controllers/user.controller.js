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
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { cookieOption } from "../constants.js";
import { generateUserAccessAndRefreshToken } from "../utils/jwt.js";
import { sendMail } from "../utils/sendMail.js";
export const registerUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    const existingUser = yield User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }
    const activationCode = Math.floor(Math.random() * 900000 + 100000).toString();
    const token = jwt.sign({
        user: { fullName, email, password },
        authCode: activationCode,
    }, process.env.ACTIVATION_TOKEN_SECRET, {
        expiresIn: process.env.ACTIVATION_TOKEN_EXPIRY,
    });
    if (!token) {
        throw new ApiError(400, "Some error occured");
    }
    yield sendMail({
        data: { name: fullName, activationCode },
        email,
        subject: "Account Verification Mail",
        templateName: "verify-mail.ejs",
    });
    return res
        .status(201)
        .json(new ApiResponse(201, { token }, `A verifcation token has been send at your email: ${email}`));
}));
export const validateUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, code } = req.body;
    let newUser;
    newUser = jwt.verify(token, process.env.ACTIVATION_TOKEN_SECRET);
    if ((newUser === null || newUser === void 0 ? void 0 : newUser.authCode) !== code) {
        throw new ApiError(400, "Invalid activation code");
    }
    const { fullName, email, password } = newUser === null || newUser === void 0 ? void 0 : newUser.user;
    const existingUser = yield User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }
    const user = yield User.create({
        fullName,
        email,
        signInFrom: "email",
        password,
        isVerified: true,
    });
    const createdUser = yield User.findById(user === null || user === void 0 ? void 0 : user._id).select("-password -refreshToken -__v -createdAt -updatedAt");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    const { accessToken, refreshToken } = yield generateUserAccessAndRefreshToken(user._id);
    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new ApiResponse(201, { user: createdUser, accessToken: token }, `Account Verified Successfully`));
}));
// register as well as login -----------------
export const socialAuthRegister = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, signInFrom } = req.body;
    let user = yield User.findOne({ email }).select("-password -refreshToken -__v -createdAt -updatedAt");
    if (!user) {
        const newUser = yield User.create({
            fullName,
            email,
            signInFrom,
            isVerified: true,
        });
        if (!newUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }
        user = yield User.findById(newUser === null || newUser === void 0 ? void 0 : newUser._id).select("-password -refreshToken -__v -createdAt -updatedAt");
    }
    const { accessToken, refreshToken } = yield generateUserAccessAndRefreshToken(user._id);
    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new ApiResponse(201, { user: user, accessToken: accessToken }, `Logged In Successfully`));
}));
export const loginUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, signInFrom } = req.body;
    const user = yield User.findOne({ email });
    if (!user || user.status !== 1) {
        throw new ApiError(404, "User do not exist, For more querries contact us.");
    }
    if (signInFrom === "email") {
        const passwordValid = yield user.isPasswordCorrect(password);
        if (!passwordValid) {
            throw new ApiError(401, "Invalid User Credentials");
        }
    }
    const { accessToken, refreshToken } = yield generateUserAccessAndRefreshToken(user._id);
    const loggedUser = yield User.findById(user._id).select("-password -refreshToken -__v -createdAt -updatedAt");
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new ApiResponse(200, {
        user: loggedUser,
        accessToken,
    }, "Logged In Successfully"));
}));
export const getUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield User.findById(req.user.id)
        .populate({ path: "institute", select: "name _id" })
        .select({ createdAt: 0, updatedAt: 0, __v: 0, password: 0, refreshToken: 0 });
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, {
        accessToken: (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken,
        user: user,
    }, "Successfully Fetched"));
}));
export const logoutUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield User.findByIdAndUpdate(req.user.id, {
        $unset: {
            refreshToken: 1,
        },
    }, {
        new: true,
    });
    return res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(new ApiResponse(200, {}, "Logged out Successfully"));
}));
export const refreshAccessToken = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request!!!");
        }
        let decodedInfo;
        if (process.env.REFRESH_TOKEN_SECRET) {
            decodedInfo = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        }
        else {
            throw new ApiError(401, "Something went wrong in authorizing");
        }
        let user;
        if (typeof decodedInfo !== "string") {
            user = yield User.findById(decodedInfo === null || decodedInfo === void 0 ? void 0 : decodedInfo.id);
        }
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        else if (user.status !== 1) {
            throw new ApiError(401, "User not allowed");
        }
        // verifying the refersh token
        if (incomingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken)) {
            throw new ApiError(401, "Invalid/Expired Refresh Token");
        }
        const { accessToken, refreshToken } = yield generateUserAccessAndRefreshToken(user === null || user === void 0 ? void 0 : user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOption)
            .cookie("refreshToken", refreshToken, cookieOption)
            .json(new ApiResponse(200, {}, "Access Token Refreshed"));
    }
    catch (error) {
        throw new ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Invalid refresh token!!!");
    }
}));
export const updateUserProfile = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { location, institute, name, phone } = req.body;
    const user = yield User.findByIdAndUpdate(req.user.id, {
        $set: {
            location, institute, name, phone
        }
    }, { new: true });
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile Updated Successfully"));
}));

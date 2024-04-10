import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookieOption } from "../constants.js";

interface IRegistrationBody {
  fullName:string, email:string, password?:string, signInFrom:string
}

// genrate tokens -------------
const generateUserAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user?.generateAccessToken();
    const refreshToken = user?.generateRefreshToken();

    if (user && refreshToken) {
      user.refreshToken = refreshToken;
    }

    await user?.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong in genrating tokens");
  }
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullName, email, password, signInFrom }:IRegistrationBody = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(409, "User already existed");
    }

    const user = await User.create({
      fullName,
      email,
      signInFrom,
      password,
    });

    const createdUser = await User.findById(user?._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, createdUser, "User registered Successfully!!")
      );
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, signInFrom } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.status !== 1) {
    throw new ApiError(404, "User does not exist");
  }

  if (signInFrom === "email") {
    const passwordValid = await user.isPasswordCorrect(password);
    if (!passwordValid) {
      throw new ApiError(401, "Invalid User Credentials");
    }
  }

  const { accessToken, refreshToken } = await generateUserAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken -__v"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOption)
    .cookie("refreshToken", refreshToken, cookieOption)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "Successfull Login"
      )
    );
});

export const logoutUser = asyncHandler(
  async (req: Request | any, res: Response) => {
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $unset: {
          refreshToken: 1
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .clearCookie("accessToken", cookieOption)
      .clearCookie("refreshToken", cookieOption)
      .json(new ApiResponse(200, {}, "Logged out Successfully"));
  }
);

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request!!!");
      }

      let decodedInfo: JwtPayload | string;
      if (process.env.REFRESH_TOKEN_SECRET) {
        decodedInfo = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
      } else {
        throw new ApiError(401, "Something went wrong in authorizing");
      }

      let user;
      if (typeof decodedInfo !== "string") {
        user = await User.findById(decodedInfo?.id)
      }

      if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
      }

      else if(user.status !== 1){
        throw new ApiError(401, "User not allowed");
      }


      // verifying the refersh token
      if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Invalid/Expired Refresh Token");
      }

      const {accessToken,refreshToken} = await generateUserAccessAndRefreshToken(user?._id)

      return res
      .status(200)
      .cookie("accessToken",accessToken,cookieOption)
      .cookie("refreshToken",refreshToken,cookieOption)
      .json(
        new ApiResponse(
          200,
          {accessToken,refreshToken},
          "Access Token Refreshed"
        )
      )

    } catch (error:any) {
      throw new ApiError(401,error?.message || "Invalid refresh token!!!")
    }
  }
);

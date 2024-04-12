import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User, UserDocument } from "../models/user.model.js";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { cookieOption } from "../constants.js";
import { generateUserAccessAndRefreshToken } from "../utils/jwt.js";
import { sendMail } from "../utils/sendMail.js";

interface IRegistrationBody {
  fullName: string;
  email: string;
  password?: string;
  signInFrom?: string;
}

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullName, email, password }: IRegistrationBody = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }
    
    const activationCode = Math.floor(Math.random() * 900000 + 100000).toString();

    const token = jwt.sign(
      {
        user: { fullName, email, password },
        authCode: activationCode,
      },
      process.env.ACTIVATION_TOKEN_SECRET as Secret,
      {
        expiresIn: process.env.ACTIVATION_TOKEN_EXPIRY,
      }
    );

    if (!token) {
      throw new ApiError(400, "Some error occured");
    }

    await sendMail({
      data: { name: fullName, activationCode },
      email,
      subject: "Account Verification Mail",
      templateName: "verify-mail.ejs",
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { token },
          `A verifcation token has been send at your email: ${email}`
        )
      );
  }
);

export const validateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, code }: { token: string; code: string } = req.body;

    let newUser: { user: IRegistrationBody; authCode: string };

    newUser = jwt.verify(
      token,
      process.env.ACTIVATION_TOKEN_SECRET as Secret
    ) as { user: IRegistrationBody; authCode: string };

    if (newUser?.authCode !== code) {
      throw new ApiError(400, "Invalid activation code");
    }

    const { fullName, email, password } = newUser?.user;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
      fullName,
      email,
      signInFrom: "email",
      password,
      isVerified: true,
    });

    const createdUser = await User.findById(user?._id).select(
      "-password -refreshToken -__v -createdAt -updatedAt"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    const { accessToken, refreshToken } =
      await generateUserAccessAndRefreshToken(user._id);

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOption)
      .cookie("refreshToken", refreshToken, cookieOption)
      .json(
        new ApiResponse(
          201,
          { user: createdUser, accessToken:token },
          `Account Verified Successfully`
        )
      );
  }
);

// register as well as login -----------------
export const socialAuthRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullName, email, signInFrom }: IRegistrationBody = req.body;

    let user:UserDocument = await User.findOne({ email }).select(
      "-password -refreshToken -__v -createdAt -updatedAt"
    );

    if (!user) {
      const newUser = await User.create({
        fullName,
        email,
        signInFrom,
        isVerified: true,
      });
  
      if (!newUser) {
        throw new ApiError(
          500,
          "Something went wrong while registering the user"
        );
      }

      user = await User.findById(newUser?._id).select(
        "-password -refreshToken -__v -createdAt -updatedAt"
      );

    }

    const { accessToken, refreshToken } =
      await generateUserAccessAndRefreshToken(user._id);

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOption)
      .cookie("refreshToken", refreshToken, cookieOption)
      .json(
        new ApiResponse(
          201,
          { user: user, accessToken: accessToken },
          `Logged In Successfully`
        )
      );
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, signInFrom } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.status !== 1) {
    throw new ApiError(404, "User do not exist, For more querries contact us.");
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
    "-password -refreshToken -__v -createdAt -updatedAt"
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
          accessToken
        },
        "Logged In Successfully"
      )
    );
});

export const getUser = asyncHandler(async (req: Request | any, res: Response) => {
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {
        accessToken:req.cookies?.accessToken,
        user: req.user,
      },
      "Successfully Fetched"
    )
  );
})

export const logoutUser = asyncHandler(
  async (req: Request | any, res: Response) => {
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $unset: {
          refreshToken: 1,
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
        user = await User.findById(decodedInfo?.id);
      }

      if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
      } else if (user.status !== 1) {
        throw new ApiError(401, "User not allowed");
      }

      // verifying the refersh token
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Invalid/Expired Refresh Token");
      }

      const { accessToken, refreshToken } =
        await generateUserAccessAndRefreshToken(user?._id);

      return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
          new ApiResponse(
            200,
            {},
            "Access Token Refreshed"
          )
        );
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid refresh token!!!");
    }
  }
);

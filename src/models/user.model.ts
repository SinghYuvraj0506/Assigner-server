import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { AvailableLoginMethods } from "../constants.js";


export interface UserDocument extends mongoose.Document {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  signInFrom: string;
  institute?: string;
  refreshToken: string;
  status: 0 | 1;
  createdAt:Date;
  updatedAt:Date;
  isPasswordCorrect(password:string):Promise<boolean>
  generateAccessToken():string
  generateRefreshToken():string
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: [true,"Please Enter your fullname"],
      trim: true,
    },
    email: {
      type: String,
      required: [true,"Please Enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
      immutable: true,
      validate: {
        validator: function (value: string) {
          // Custom email validation logic
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(value);
        },
        message: (props: { value: string }) =>
          `${props?.value} is not a valid email!`,
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function (value: string) {
          // Custom phone number validation logic
          const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
          return phoneRegex.test(value);
        },
        message: (props: { value: string }) =>
          `${props?.value} is not a valid phone number!`,
      },
    },
    password: {
      type: String,
    },
    signInFrom: {
      type: String,
      enum:AvailableLoginMethods,
      required: [true,"Please select the login method"],
    },
    institute: {
      type: mongoose.Types.ObjectId,
      ref: "Institute",
    },
    refreshToken: {
      type: String,
    },
    status: {
      type: Number,
      enum: { values: [0, 1], message: "Invalid Status Value!!!" }, // 0 for inactive and 1 for active
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// mongoose middlewares & methods  ----------------------------------------------
userSchema.pre<UserDocument>("save", async function (next) {

  if (!this.isModified("password")) return next();
  else if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  let user = this as UserDocument
  if(user.password){
    return await bcrypt.compare(password, user.password);
  }
};

userSchema.methods.generateAccessToken = function () {
  let user = this as UserDocument

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      status: user.status,
      fullName: user.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  let user = this as UserDocument

  return jwt.sign(
    {
      id: user._id
    },
    process.env.REFRESH_TOKEN_SECRET as Secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model<UserDocument>("User", userSchema);

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      immutable: true,
    },
    phone: {
      type: String,
      unique: true,
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
      enum: { values: ["google", "email"], message: "Invalid Signin Method!!" },
      required: true,
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
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  else if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        status: this.status,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET ?? "",
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET ?? "",
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
};

export const User = mongoose.model("User", userSchema);

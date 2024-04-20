var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AvailableLoginMethods } from "../constants.js";
const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Please Enter your fullname"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please Enter your email"],
        unique: true,
        lowercase: true,
        trim: true,
        immutable: true,
        validate: {
            validator: function (value) {
                // Custom email validation logic
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(value);
            },
            message: (props) => `${props === null || props === void 0 ? void 0 : props.value} is not a valid email!`,
        },
    },
    phone: {
        type: String,
        validate: {
            validator: function (value) {
                // Custom phone number validation logic
                const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
                return phoneRegex.test(value);
            },
            message: (props) => `${props === null || props === void 0 ? void 0 : props.value} is not a valid phone number!`,
        },
    },
    password: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    signInFrom: {
        type: String,
        enum: AvailableLoginMethods,
        required: [true, "Please select the login method"],
    },
    institute: {
        type: mongoose.Types.ObjectId,
        ref: "Institute",
    },
    location: {
        type: Object
    },
    refreshToken: {
        type: String,
    },
    status: {
        type: Number,
        enum: { values: [0, 1], message: "Invalid Status Value!!!" }, // 0 for inactive and 1 for active
        default: 1,
    },
}, {
    timestamps: true,
});
// mongoose middlewares & methods  ----------------------------------------------
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        else if (this.password) {
            this.password = yield bcrypt.hash(this.password, 10);
            next();
        }
    });
});
userSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = this;
        if (user.password) {
            return yield bcrypt.compare(password, user.password);
        }
    });
};
userSchema.methods.generateAccessToken = function () {
    let user = this;
    return jwt.sign({
        id: user._id,
        email: user.email,
        status: user.status,
        fullName: user.fullName,
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};
userSchema.methods.generateRefreshToken = function () {
    let user = this;
    return jwt.sign({
        id: user._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};
export const User = mongoose.model("User", userSchema);

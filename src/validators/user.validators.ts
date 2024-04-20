import { body } from "express-validator";
import { AvailableLoginMethods } from "../constants.js";

export const registerUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("fullName").trim().notEmpty().withMessage("Full Name is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

export const socialAuthRegisterUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("fullName").trim().notEmpty().withMessage("Full Name is required"),
    body("signInFrom")
      .isIn(AvailableLoginMethods)
      .withMessage("Invalid Login Method"),
  ];
};

export const validateUserValidator = () => {
  return [
    body("token")
      .notEmpty()
      .withMessage("Token is required")
      .isJWT()
      .withMessage("Token is Invalid"),
    body("code").trim().notEmpty().withMessage("Activation Code is required"),
  ];
};

export const loginUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password").optional().notEmpty().withMessage("Password is required"),
    body("signInFrom")
      .isIn(AvailableLoginMethods)
      .withMessage("Invalid Login Method"),
  ];
};

export const updateUserValidator = () => {
  return [
    body("name").optional().trim().notEmpty().withMessage("Name is required"),
    body("location").optional().notEmpty().withMessage("Location is required"),
    body("phone").optional().notEmpty().withMessage("Phone is required").isLength({min:10}),
    body("institute").optional().notEmpty().withMessage("Institute is required")
  ];
};

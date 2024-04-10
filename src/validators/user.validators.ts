import {body} from "express-validator"
import { AvailableLoginMethods } from "../constants.js";

export const registerUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full Name is required"),
    body("password")
      .optional()
      .notEmpty()
      .withMessage("Password is required"),
    body("signInFrom")
        .isIn(AvailableLoginMethods)
        .withMessage("Invalid Login Method")
  ];
}


export const loginUserValidator = () =>{
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password")
      .optional()
      .notEmpty()
      .withMessage("Password is required"),
    body("signInFrom")
        .isIn(AvailableLoginMethods)
        .withMessage("Invalid Login Method")
  ];
}


import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (req:Request, res:Response , next:NextFunction) => {

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  throw new ApiError(422, errors?.array()[0]?.msg ?? "Received data is not valid");
};
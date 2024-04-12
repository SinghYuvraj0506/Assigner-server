import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export const ErrorMiddleware = (err:any,req:Request,res:Response,next:NextFunction) => {
    err.statusCode = err?.statusCode || 500
    err.message = err.message || "Internal Server Error"

    // checking the types of error-----------
    if(err?.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ApiError(400,message)
    }

    // Duplicate key Error ---------
    else if(err?.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ApiError(400,message)
    }

    // jwt Error ---------
    else if(err?.name === "JsonWebTokenError"){
        const message = `Invalid Token, Try Again!!!!!`
        err = new ApiError(400,message)
    }

    // token expire Error ---------
    else if(err?.name === "TokenExpiredError"){
        const message = `Token Expired, Try Again!!!!!`
        err = new ApiError(400,message)
    }

    return res.status(err?.statusCode).json({
        success:false,
        message : err.message
    })

}


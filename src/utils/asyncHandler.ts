import { Request,Response,NextFunction,RequestHandler } from "express";

// Higher order function 
// method-1 for asyn handler ------
const asyncHandler = (requestHandler:RequestHandler) => (req:Request,res:Response,next:NextFunction) => (
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
)


// method 2

// const asyncHandler2 = (requestHandler) = async (req,res,next) => { 
//     try {
//         await requestHandler(req,res,next)
//     } catch (error) {
//         next(err)
//     }
// }


export default asyncHandler;
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { checkEmptyValues, isValidValue, validateEmail } from "../validators/user.validators.js";

// genrate tokens -------------
const generateUserAccessAndRefreshToken = async (userId:string) =>{
  try {
    const user = await User.findById(userId)
  
    const accessToken = user?.generateAccessToken()
    const refreshToken = user?.generateRefreshToken()
  
    if(user && refreshToken){
      user.refreshToken = refreshToken
    }

    await user?.save()
  
    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong in genrating tokens")
  }
}


export const registerUser = asyncHandler(async (req: Request, res: Response) => {
   const { fullName, email, password, signInFrom } = req.body;

  //  validations -----------------------
   if(checkEmptyValues([fullName, email, password, signInFrom])){
    throw new ApiError(400,"All fields are required")
   }

   else if(!validateEmail(email)){
    throw new ApiError(400,"Invalid email address")
   }

   else if(!isValidValue(signInFrom,["google","email"])){
    throw new ApiError(400,"Invalid register method")
   }

 
   const existingUser = await User.findOne({email})
 
   if(existingUser){
     throw new ApiError(409,"User already existed")
   }
 
   const user = await User.create({
     fullName,email,signInFrom,password
   })
 
   const createdUser = await User.findById(user?._id).select("-password -refreshToken")
 
   if(!createdUser){
     throw new ApiError(500, "Something went wrong while registering the user")
   }
 
   return res.status(201).json(new ApiResponse(201,createdUser,"User registered Successfully!!"))
});


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password , signInFrom } = req.body;
 
  //  validations -----------------------
   if(checkEmptyValues([email, signInFrom])){
    throw new ApiError(400,"All fields are required")
   }

   else if(!validateEmail(email)){
    throw new ApiError(400,"Invalid email address")
   }

   else if(!isValidValue(signInFrom,["google","email"])){
    throw new ApiError(400,"Invalid login method")
   }


  const user = await User.findOne({email})

  if(!user || user.status !== 1){
    throw new ApiError(404,"User does not exist")
  }

  if(signInFrom === "email"){
    const passwordValid = await user.isPasswordCorrect(password)
    if(!passwordValid){
      throw new ApiError(401,"Invalid User Credentials")
    }
  }

  const {accessToken,refreshToken} = await generateUserAccessAndRefreshToken(user._id)

  const loggedUser = await User.findById(user._id).select("-password -refreshToken -__v")

  const options = {
    httpOnlu:true,
    secure:true
  }
  
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedUser,accessToken,refreshToken
      },
      "Successfull Login"
    )
  )
})


export const logoutUser = asyncHandler(async(req: Request | any, res: Response)=>{
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $set:{
          refreshToken:undefined
        }
      },{
        new:true
      }
    )

    const options = {
      httpOnlu:true,
      secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
      200,
      {},
      "Logged out Successfully"
    ))
})
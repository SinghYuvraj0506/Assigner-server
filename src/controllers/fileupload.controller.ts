import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { FileUpload } from "../models/fileupload.model.js";

export const uploadFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    // Check if files are present in the request
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "Files not found for uploading");
    }

    if(!req.body.usage){
        throw new ApiError(400, "Usage is required field");
    }

    try {
        let finalArr:any = []

      const uploadPromises: Promise<void>[] = (
        req.files as Express.Multer.File[]
      ).map(async (file: Express.Multer.File) => {
        // upload file on cloudinary ---------------
        const uploadResponse = await uploadOnCloudinary(file?.path,req.body.usage);

        if(!uploadResponse){
            throw new ApiError(400, "Cloudinary file upload failed");
        }

        // saving in db
        const savedFile = await FileUpload.create({
          fileName: file?.originalname,
          fileUrl:uploadResponse?.secure_url,
          fileType:file?.mimetype,
          usage:req.body.usage,
          status:1
        });

        finalArr.push(savedFile?._id)
        Promise.resolve();
      });

      // Wait for all promises to resolve
      await Promise.all(uploadPromises);

      return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            finalArr,
            "Files uploaded successfully"
        )
      )
    } catch (error:any) {
        throw new ApiError(400, error?.message || "Files uploading failed");
    }
  }
);

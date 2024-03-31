import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


export const uploadOnCloudinary = async (localfilepath: string,usage:string) => {
  try {
    if (!localfilepath) return null;

    // file upload to cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",folder:usage
    });

    console.log("File uploaded on cloudinary", response?.url);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    // remove the saved files---------------------------
    fs.unlinkSync(localfilepath);
    return null;
  }
};

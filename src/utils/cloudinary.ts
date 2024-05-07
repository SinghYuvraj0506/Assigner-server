import { v2 as cloudinary } from "cloudinary";
import { timeStamp } from "console";
import fs from "fs";

export const uploadOnCloudinary = async (
  localfilepath: string,
  usage: string
) => {
  try {
    if (!localfilepath) return null;

    // file upload to cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
      folder: usage,
    });

    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    // remove the saved files---------------------------
    fs.unlinkSync(localfilepath);
    return null;
  }
};

export const generateSignature = async (folder: string) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timeStamp: timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET as string
    );

    return { timestamp, signature };
  } catch (error) {
    console.log(error);
    return null;
  }
};

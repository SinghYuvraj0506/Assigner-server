var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { FileUpload } from "../models/fileupload.model.js";
import fs from "fs";
import { PdfCounter } from "page-count";
export const uploadFile = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if files are present in the request
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "Files not found for uploading");
    }
    if (!req.body.usage) {
        throw new ApiError(400, "Usage is required field");
    }
    try {
        let finalArr = [];
        const uploadPromises = req.files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            let pages = 0;
            // count pdf pages ---------------
            if (file.mimetype === "application/pdf") {
                const fileBuffer = fs.readFileSync(file === null || file === void 0 ? void 0 : file.path);
                pages = yield PdfCounter.count(fileBuffer);
            }
            else {
                pages = 1;
            }
            // upload file on cloudinary ---------------
            const uploadResponse = yield uploadOnCloudinary(file === null || file === void 0 ? void 0 : file.path, req.body.usage);
            if (!uploadResponse) {
                throw new ApiError(400, "Cloudinary file upload failed");
            }
            // saving in db
            const savedFile = yield FileUpload.create({
                fileName: file === null || file === void 0 ? void 0 : file.originalname,
                publicId: uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.public_id,
                fileUrl: uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.secure_url,
                fileType: file === null || file === void 0 ? void 0 : file.mimetype,
                usage: req.body.usage,
                status: 1,
                pageCount: pages,
            });
            finalArr.push(savedFile === null || savedFile === void 0 ? void 0 : savedFile._id);
            Promise.resolve();
        }));
        // Wait for all promises to resolve
        yield Promise.all(uploadPromises);
        return res
            .status(200)
            .json(new ApiResponse(200, finalArr, "Files uploaded successfully"));
    }
    catch (error) {
        console.log(error);
        throw new ApiError(400, (error === null || error === void 0 ? void 0 : error.message) || "Files uploading failed");
    }
}));

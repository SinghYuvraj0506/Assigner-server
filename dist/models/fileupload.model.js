import mongoose, { Schema } from "mongoose";
import { fileTypeEnum, usageEnum } from "../constants.js";
const fileUploadSchema = new Schema({
    fileUrl: {
        type: String, // upload file url -----------------
        required: true,
    },
    publicId: {
        type: String, // upload file url -----------------
        required: true,
    },
    fileName: {
        type: String, // upload file url -----------------
        required: true,
    },
    fileType: {
        type: String,
        enum: { values: fileTypeEnum, message: "Invalid file type!!!" },
        required: true,
    },
    usage: {
        type: String,
        enum: { values: usageEnum, message: "Invalid usage value!!!" },
    },
    pageCount: {
        type: Number
    },
    status: {
        type: Number,
        enum: { values: [0, 1], message: "Invalid Status Value!!!" }, // 0 for inactive and 1 for active
        default: 1,
    },
}, {
    timestamps: true,
});
export const FileUpload = mongoose.model("file_upload", fileUploadSchema);

import mongoose, { Schema } from "mongoose";

const fileTypeEnum = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const usageEnum = ["assignments"];

interface fileUploadDocument extends mongoose.Document {
  fileUrl: string;
  fileName: string;
  fileType: "image/jpeg" | "image/jpg" | "image/png" | "application/pdf";
  usage: "assignments";
  status: 0 | 1;
  createdAt: Date;
  updatedAt: Date;
}

const fileUploadSchema = new Schema(
  {
    fileUrl: {
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
    status: {
      type: Number,
      enum: { values: [0, 1], message: "Invalid Status Value!!!" }, // 0 for inactive and 1 for active
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const FileUpload = mongoose.model<fileUploadDocument>(
  "file_upload",
  fileUploadSchema
);

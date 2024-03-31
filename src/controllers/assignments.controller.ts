import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  checkEmptyValues,
  isValidDate,
} from "../validators/user.validators.js";
import { Assignments } from "../models/assignments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createAssignment = asyncHandler(
  async (req: Request | any, res: Response) => {
    const { name, instructions, completionTime, fileIdArray } = req.body;

    // validations ------------------
    if (checkEmptyValues([name, instructions, completionTime])) {
      throw new ApiError(400, "All fields are required");
    }

    if (!fileIdArray || fileIdArray?.length === 0) {
      throw new ApiError(400, "Files are required");
    }

    if (!isValidDate(completionTime)) {
      throw new ApiError(400, "Invalid Completion Date");
    }

    const assignment = await Assignments.create({
      name,
      instructions,
      completionTime,
      file: fileIdArray,
      owner: req.user._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, assignment, "Assignment created successfully")
      );
  }
);

export const getAllAssignments = asyncHandler(
  async (req: Request | any, res: Response) => {
    const assignments = await Assignments.aggregate([
      {
        $match: {
          owner: req.user._id,
          status: {
            $ne: 0,
          },
        },
      },
      {
        $unwind: "$file",
      },
      {
        $lookup: {
          from: "file_uploads",
          localField: "file",
          foreignField: "_id",
          as: "file",
          pipeline:[{
            $project:{
              fileUrl:1,
              fileName:1,
              fileType:1,
              status:1
            }
          }]
        },
      },
      {
        $addFields: {
          file: {
            $arrayElemAt: ["$file", 0],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          files: {
            $push: "$file",
          },
          name: { $first: "$name" },
          instructions: { $first: "$instructions" },
          completionTime: { $first: "$completionTime" },
          createdAt: { $first: "$createdAt" },
          status: { $first: "$status" },
        },
      },
      {
        $project: {
          name: 1,
          instructions: 1,
          completionTime: 1,
          createdAt: 1,
          status: 1,
          files:1,
          _id:1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, assignments, "Assignment fetched succesfully")
      );
  }
);

import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Assignments } from "../models/assignments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FileUpload } from "../models/fileupload.model.js";
import Pricing from "../models/pricing.model.js";
import informLarkBot from "../utils/informLarkBot.js";

export const createAssignment = asyncHandler(
  async (req: Request | any, res: Response) => {
    const { name, instructions, completionTime, fileIdArray, amount, delivery } = req.body;

    const assignment = await Assignments.create({
      name,
      instructions,
      completionTime,
      file: fileIdArray,
      owner: req.user._id,
      amount,
      delivery
    });

    //  informing on lark --------------------
    informLarkBot(
      process.env.LARK_NEW_ASSIGNMENT_WEBHOOK as string,
      `New Assignment Created By ${req?.user?.fullName}`,
      [
        `Assigment Name - ${name}`,
        `Delivery Date - ${new Date(completionTime).toDateString()}`,
        `Delivery Address - ${delivery}`,
        `Amount - ${amount}`,
        `User Email - ${req?.user?.email}`,
        `Created At - ${new Date().toLocaleString()}`
      ]
    )

    return res
      .status(200)
      .json(
        new ApiResponse(200, assignment, "Assignment created successfully")
      );
  }
);

export const updateAssignment = asyncHandler(
  async (req: Request | any, res: Response) => {

    const { name, instructions, completionTime, fileIdArray , assignmentId } = req.body

    let assignment = await Assignments.findById(assignmentId)

    if(!assignment){
      throw new ApiError(400,"Invalid assignment Id!!")
    }

    assignment = await Assignments.findByIdAndUpdate(
      assignmentId,
      {
        $set:{
          name,
          instructions,
          completionTime,
          file: fileIdArray,
        }
      },{
        new:true
      }
    )

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignment,
        "Assignment Updated Successfully"
      )
    )

  }
)

export const getAllAssignments = asyncHandler(
  async (req: Request | any, res: Response) => {
    const {
      page = 1,
      limit = 20,
      query = "",
      status,
      sortBy = "createdAt",
      sortType = "desc",
    } = req.query;


    // filter params ---------------------------------------
    let sortParam: {
      [key: string]: 1 | -1;
    } = {};
    
    sortParam[sortBy] = sortType === 'asc' ? 1 : -1;

    let statusParam = status ? parseInt(status) : {$ne:0}

    const assignments = await Assignments.aggregate([
      {
        $match: {
          owner: req.user._id,
          status:statusParam,
          name: {
            $regex: new RegExp(`.*${query}.*`, "i")
          }
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
          pipeline: [
            {
              $project: {
                fileUrl: 1,
                fileName: 1,
                fileType: 1,
                status: 1,
              },
            },
          ],
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
          amount: { $first: "$amount" },
        },
      },
      {
        $project: {
          name: 1,
          instructions: 1,
          completionTime: 1,
          createdAt: 1,
          amount:1,
          status: 1,
          files: 1,
          _id: 1,
        },
      },
    ]).sort(sortParam).skip((parseInt(page)-1)*parseInt(limit)).limit(parseInt(limit))

    return res
      .status(200)
      .json(
        new ApiResponse(200, {data:assignments,page,limit,count:assignments?.length}, "Assignment fetched succesfully")
      );
  }
);

export const calculateAmount = asyncHandler(
  async (req: Request | any, res: Response) => {
    const {files} = req.body
    let totalPages:number = 0;

    for (let index = 0; index < files.length; index++) {
      const element = files[index];
      let fileData = await FileUpload.findById(element);
      totalPages += fileData?.pageCount ?? 1
    }

    if(totalPages > 20){
      return res.status(200).json(new ApiResponse(200,{amount:"Would be informed"},"Approx amount calculated"))
    }

    let pricing = await Pricing.findOne({"pageRange.from":{$lte:totalPages} , "pageRange.to" : {$gte:totalPages}})

    return res.status(200).json(new ApiResponse(200,{amount:pricing?.amountWithoutReasearch},"Approx amount calculated"))
  })

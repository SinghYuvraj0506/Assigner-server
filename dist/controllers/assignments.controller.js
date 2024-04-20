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
import { Assignments } from "../models/assignments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FileUpload } from "../models/fileupload.model.js";
import Pricing from "../models/pricing.model.js";
export const createAssignment = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, instructions, completionTime, fileIdArray, amount, delivery } = req.body;
    const assignment = yield Assignments.create({
        name,
        instructions,
        completionTime,
        file: fileIdArray,
        owner: req.user._id,
        amount,
        delivery
    });
    return res
        .status(200)
        .json(new ApiResponse(200, assignment, "Assignment created successfully"));
}));
export const updateAssignment = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, instructions, completionTime, fileIdArray, assignmentId } = req.body;
    let assignment = yield Assignments.findById(assignmentId);
    if (!assignment) {
        throw new ApiError(400, "Invalid assignment Id!!");
    }
    assignment = yield Assignments.findByIdAndUpdate(assignmentId, {
        $set: {
            name,
            instructions,
            completionTime,
            file: fileIdArray,
        }
    }, {
        new: true
    });
    return res
        .status(200)
        .json(new ApiResponse(200, assignment, "Assignment Updated Successfully"));
}));
export const getAllAssignments = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 2, query = "", status, sortBy = "createdAt", sortType = "desc", } = req.query;
    // filter params ---------------------------------------
    let sortParam = {};
    sortParam[sortBy] = sortType === 'asc' ? 1 : -1;
    let statusParam = status ? parseInt(status) : { $ne: 0 };
    const assignments = yield Assignments.aggregate([
        {
            $match: {
                owner: req.user._id,
                status: statusParam,
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
                amount: 1,
                status: 1,
                files: 1,
                _id: 1,
            },
        },
    ]).sort(sortParam).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    return res
        .status(200)
        .json(new ApiResponse(200, { data: assignments, page, limit, count: assignments === null || assignments === void 0 ? void 0 : assignments.length }, "Assignment fetched succesfully"));
}));
export const calculateAmount = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { files } = req.body;
    let totalPages = 0;
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        let fileData = yield FileUpload.findById(element);
        totalPages += (_a = fileData === null || fileData === void 0 ? void 0 : fileData.pageCount) !== null && _a !== void 0 ? _a : 1;
    }
    if (totalPages > 20) {
        return res.status(200).json(new ApiResponse(200, { amount: "Would be informed" }, "Approx amount calculated"));
    }
    let pricing = yield Pricing.findOne({ "pageRange.from": { $lte: totalPages }, "pageRange.to": { $gte: totalPages } });
    return res.status(200).json(new ApiResponse(200, { amount: pricing === null || pricing === void 0 ? void 0 : pricing.amountWithoutReasearch }, "Approx amount calculated"));
}));

import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Institutions } from "../models/institution.model.js";


export const getInstitutionList = asyncHandler(async (req: Request, res: Response) => {
    const insitutes = await Institutions.find({status:1}).select({_id:1,name:1}).lean()
    const transformedInstitutes = insitutes?.map(institute => ({
        value: institute._id,
        label: institute.name
    }));

    return res.status(200).json(new ApiResponse(200,transformedInstitutes,"Institutes fetched Successfully"))
})
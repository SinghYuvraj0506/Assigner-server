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
import { ApiResponse } from "../utils/ApiResponse.js";
import { Institutions } from "../models/institution.model.js";
export const getInstitutionList = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const insitutes = yield Institutions.find({ status: 1 }).select({ _id: 1, name: 1 }).lean();
    const transformedInstitutes = insitutes === null || insitutes === void 0 ? void 0 : insitutes.map(institute => ({
        value: institute._id,
        label: institute.name
    }));
    return res.status(200).json(new ApiResponse(200, transformedInstitutes, "Institutes fetched Successfully"));
}));

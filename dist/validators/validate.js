import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
export const validate = (req, res, next) => {
    var _a, _b;
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    throw new ApiError(422, (_b = (_a = errors === null || errors === void 0 ? void 0 : errors.array()[0]) === null || _a === void 0 ? void 0 : _a.msg) !== null && _b !== void 0 ? _b : "Received data is not valid");
};

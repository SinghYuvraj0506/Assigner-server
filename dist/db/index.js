var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const connnectionInstance = yield mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("MongoDB connected successfully at DB HOST:", (_a = connnectionInstance === null || connnectionInstance === void 0 ? void 0 : connnectionInstance.connection) === null || _a === void 0 ? void 0 : _a.host);
    }
    catch (error) {
        console.log("MongoDB connection Failed:", error);
        process.exit(1);
    }
});
export default connectDB;

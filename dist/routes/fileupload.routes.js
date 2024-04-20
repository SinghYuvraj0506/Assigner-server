import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../controllers/fileupload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
// secured routes --------------------
router.route("/upload").post(verifyJWT, upload.array("files"), uploadFile);
export default router;

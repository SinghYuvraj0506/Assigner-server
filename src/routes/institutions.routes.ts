import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getInstitutionList } from "../controllers/institution.controller.js";

const router = Router()

// secured routes --------------------
router.route("/getAll").get(
    verifyJWT,
    getInstitutionList
    )


export default router;
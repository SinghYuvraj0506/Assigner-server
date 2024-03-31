import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAssignment, getAllAssignments } from "../controllers/assignments.controller.js";

const router = Router()

// secured routes ----------------------------------------------
router.route("/create").post(
    verifyJWT,
    createAssignment
    )


router.route("/getAll").post(
    verifyJWT,
    getAllAssignments
    )


export default router;
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  calculateAmount,
  createAssignment,
  getAllAssignments,
  updateAssignment,
} from "../controllers/assignments.controller.js";
import {
  calculateAmountValidator,
  createAssignmentValidator,
  updateAssignmentValidator,
} from "../validators/assignments.validators.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/create")
  .post(createAssignmentValidator(), validate, createAssignment);

router
  .route("/update")
  .patch(updateAssignmentValidator(), validate, updateAssignment);

router.route("/getAll").get(getAllAssignments);

router.route("/getApproxAmount").post(calculateAmountValidator(),validate,calculateAmount);

export default router;

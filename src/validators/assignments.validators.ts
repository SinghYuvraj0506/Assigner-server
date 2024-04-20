import { body } from "express-validator";
import { AvailableLoginMethods } from "../constants.js";

export const createAssignmentValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("instructions")
      .trim()
      .notEmpty()
      .withMessage("Instructions are required"),
    body("amount")
      .optional(),
    body("delivery")
      .trim()
      .notEmpty()
      .withMessage("Delivery is required"),
    body("completionTime")
      .notEmpty()
      .withMessage("Completion Date is required"),
    body("fileIdArray")
      .isArray({ min: 1 })
      .withMessage("Invalid files Data Array"),
    body("fileIdArray.*").isMongoId().withMessage("Invalid files Data!!!"),
  ];
};

export const updateAssignmentValidator = () => {
  return [
    body("assignmentId").notEmpty().withMessage("Assignment Id is required").isMongoId().withMessage("Invalid Assignment Id!!"),
    body("name").optional().trim().notEmpty().withMessage("Name is required"),
    body("instructions")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Instructions are required"),
    body("completionTime")
      .optional()
      .notEmpty()
      .withMessage("Completion Date is required")
      .isDate()
      .withMessage("Invalid Completion Date"),
    body("fileIdArray")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Invalid files Data Array"),
    body("fileIdArray.*")
      .isMongoId()
      .withMessage("Invalid files Data!!!"),
  ];
};


export const calculateAmountValidator = () => {
  return [
    body("files")
      .isArray({ min: 1 })
      .withMessage("Invalid files Data Array"),
    body("files.*")
      .isMongoId()
      .withMessage("Invalid files Data!!!"),
  ];
};


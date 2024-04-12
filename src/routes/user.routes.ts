import { Router } from "express";
import { getUser, loginUser, logoutUser, refreshAccessToken, registerUser, socialAuthRegister, validateUser } from "../controllers/user.controller.js";
import { ensureGuest, verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUserValidator, registerUserValidator, socialAuthRegisterUserValidator, validateUserValidator } from "../validators/user.validators.js";
import { validate } from "../validators/validate.js";

const router = Router()

// routes ----------------------
router.route("/register").post(ensureGuest,registerUserValidator(),validate,registerUser)
router.route("/validateAccount").post(ensureGuest,validateUserValidator(),validate,validateUser)
router.route("/socialAuthRegister").post(ensureGuest,socialAuthRegisterUserValidator(),validate,socialAuthRegister)
router.route("/login").post(ensureGuest,loginUserValidator(),validate,loginUser)


// secured routes --------------------
router.route("/me").get(
    verifyJWT,
    getUser
    )
router.route("/logout").post(
    verifyJWT,
    logoutUser
    )
router.route("/refreshToken").get(
    refreshAccessToken
    )



export default router;
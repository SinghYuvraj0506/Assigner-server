import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUserValidator, registerUserValidator } from "../validators/user.validators.js";
import { validate } from "../validators/validate.js";

const router = Router()

// routes ----------------------
router.route("/register").post(registerUserValidator(),validate,registerUser)
router.route("/login").post(loginUserValidator(),validate,loginUser)


// secured routes --------------------
router.route("/logout").post(
    verifyJWT,
    logoutUser
    )
router.route("/refreshToken").post(
    refreshAccessToken
    )



export default router;
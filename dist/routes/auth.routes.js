import { Router } from "express";
import { FailureLoginHanlder, GoogleCallback, SuccessLoginHanlder, openGoogleAuth } from "../controllers/auth.controller.js";
import { ensureGuest } from "../middlewares/auth.middleware.js";
const router = Router();
// routes ----------------------
router.route("/google").get(ensureGuest, openGoogleAuth);
router.route("/google/callback").get(ensureGuest, GoogleCallback);
router.route("/google/success").get(ensureGuest, SuccessLoginHanlder);
router.route("/google/failure").get(ensureGuest, FailureLoginHanlder);
export default router;

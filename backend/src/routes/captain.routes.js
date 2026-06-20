import express from "express";
import {
  sendCaptainOTP,
  verifyCaptainOTP,
  completeCaptainProfile,
  getCurrentRide,
} from "../controllers/captain.controller.js";
import { captainAuth } from "../middlewares/captainAuth.middleware.js";
import { captainOnboardAuth } from "../middlewares/captainOnboardAuth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendCaptainOTP);
router.post("/verify-otp", verifyCaptainOTP);

// FIX: complete-profile now requires onboard token (issued only after OTP verified)
router.post("/complete-profile", captainOnboardAuth, completeCaptainProfile);

router.get("/current-ride", captainAuth, getCurrentRide);

export default router;
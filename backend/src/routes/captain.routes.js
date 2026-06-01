import express from "express";

import {
  sendCaptainOTP,
  verifyCaptainOTP,
  completeCaptainProfile,
  getCurrentRide
} from "../controllers/captain.controller.js";
import { captainAuth } from "../middlewares/captainAuth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendCaptainOTP);
router.post("/verify-otp", verifyCaptainOTP);
router.post("/complete-profile", completeCaptainProfile);
router.get("/current-ride", captainAuth, getCurrentRide);

export default router;

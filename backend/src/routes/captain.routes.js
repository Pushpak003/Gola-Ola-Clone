import express from "express";

import {
  sendCaptainOTP,
  verifyCaptainOTP,
  completeCaptainProfile,
  getCurrentRide
} from "../controllers/captain.controller.js";

const router = express.Router();

router.post("/send-otp", sendCaptainOTP);
router.post("/verify-otp", verifyCaptainOTP);
router.post("/complete-profile", completeCaptainProfile);
router.get("/current-ride", getCurrentRide);

export default router;

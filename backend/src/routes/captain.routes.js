import express from "express";

import {
  sendCaptainOTP,
  verifyCaptainOTP,
  completeCaptainProfile,
} from "../controllers/captain.controller.js";

const router = express.Router();

router.post(
  "/send-otp",
  sendCaptainOTP
);

router.post(
  "/verify-otp",
  verifyCaptainOTP
);

router.post(
  "/complete-profile",
  completeCaptainProfile
);

export default router;
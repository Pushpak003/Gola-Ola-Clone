import {
  sendCaptainOTPService,
  verifyCaptainOTPService,
} from "../services/captain.service.js";
import { generateToken } from "../utils/generateToken.js";
import { getCaptainCurrentRideService } from "../services/ride.service.js";
import prisma from "../config/db.js";
import jwt from "jsonwebtoken";

export const sendCaptainOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    await sendCaptainOTPService(phone);
    res.status(200).json({ success: true, message: "OTP Sent" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyCaptainOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const captain = await verifyCaptainOTPService(phone, otp);

    if (!captain) {
      // Issue a short-lived onboard token (15 min) so only OTP-verified phone can complete profile
      const onboardToken = jwt.sign(
        { phone, purpose: "captain-onboard" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      return res.status(200).json({
        success: true,
        onboardingRequired: true,
        onboardToken,
        phone,
      });
    }

    const token = generateToken({ id: captain.id, role: "CAPTAIN" });
    res.status(200).json({ success: true, token, captain });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const completeCaptainProfile = async (req, res) => {
  try {
    // req.onboardPhone is set by captainOnboardAuth middleware
    const { fullname, vehicleType, vehicleNumber } = req.body;
    const phone = req.onboardPhone;

    if (!phone) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Prevent duplicate vehicle number
    const existing = await prisma.captain.findUnique({ where: { vehicleNumber } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Vehicle number already registered" });
    }

    const captain = await prisma.captain.create({
      data: { fullname, phone, vehicleType, vehicleNumber },
    });

    const token = generateToken({ id: captain.id, role: "CAPTAIN" });
    res.status(201).json({ success: true, token, captain });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCurrentRide = async (req, res) => {
  try {
    const ride = await getCaptainCurrentRideService(req.captain.id);
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
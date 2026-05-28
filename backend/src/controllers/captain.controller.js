import {
  sendCaptainOTPService,
  verifyCaptainOTPService,
} from "../services/captain.service.js";
import { generateToken } from "../utils/generateToken.js";
import prisma from "../config/db.js";

export const sendCaptainOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    await sendCaptainOTPService(phone);

    res.status(200).json({
      success: true,
      message: "OTP Sent",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyCaptainOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const captain = await verifyCaptainOTPService(phone, otp);

    if (!captain) {
      return res.status(200).json({
        success: true,
        onboardingRequired: true,
        phone,
      });
    }

    const token = generateToken({
      id: captain.id,
    });

    res.status(200).json({
      success: true,
      token,
      captain,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const completeCaptainProfile = async (req, res) => {
  try {
    const { fullname, phone, vehicleType, vehicleNumber } = req.body;

    const captain = await prisma.captain.create({
      data: {
        fullname,
        phone,
        vehicleType,
        vehicleNumber,
      },
    });

    const token = generateToken({
      id: captain.id,
    });

    res.status(201).json({
      success: true,
      token,
      captain,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

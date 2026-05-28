import {sendOTPService,verifyOTPService,} from "../services/auth.service.js";

import { generateToken } from "../utils/generateToken.js";

export const sendOTP = async ( req, res) => {
  try {
    const { phone } = req.body;
    await sendOTPService(phone);
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

export const verifyOTP = async (
  req,
  res
) => {

  try {

    const { phone, otp } = req.body;

    const user =
      await verifyOTPService(
        phone,
        otp
      );

    const token = generateToken({
      id: user.id,
      role: "USER",
    });

    res.status(200).json({
      success: true,
      token,
      user,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
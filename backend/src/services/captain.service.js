import prisma from "../config/db.js";
import { generateOTP }from "../utils/generateOTP.js";
import {sendSMS} from "../services/sms.service.js";
export const sendCaptainOTPService =async (phone) => {
  const otp = generateOTP();
  const expiresAt = new Date( Date.now() + 5 * 60 * 1000);

  await prisma.oTP.create({data: {
    phone,code: otp,expiresAt,
    },
  });

  await sendSMS(phone, otp);
  console.log(
    "Captain OTP:",
    otp
  );

};
export const verifyCaptainOTPService = async (phone, otp) => {

  const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,code: otp,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  if (!otpRecord) {
    throw new Error(
      "Invalid OTP"
    );
  }

  if (
    new Date() >
    otpRecord.expiresAt
  ) {
    throw new Error(
      "OTP Expired"
    );
  }

  const captain =
    await prisma.captain.findUnique({
      where: {
        phone,
      },
    });

  return captain;
};
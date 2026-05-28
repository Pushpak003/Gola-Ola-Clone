import prisma from "../config/db.js";

import { generateOTP } from "../utils/generateOTP.js";

export const sendOTPService = async (
  phone
) => {

  const otp = generateOTP();

  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  );

  await prisma.oTP.create({
    data: {
      phone,
      code: otp,
      expiresAt,
    },
  });

  console.log("OTP:", otp);

  return otp;
};

export const verifyOTPService = async (
  phone,
  otp
) => {

  const otpRecord =
    await prisma.oTP.findFirst({
      where: {
        phone,
        code: otp,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  if (!otpRecord) {
    throw new Error("Invalid OTP");
  }

  if (
    new Date() > otpRecord.expiresAt
  ) {
    throw new Error("OTP Expired");
  }

  let user =
    await prisma.user.findUnique({
      where: {
        phone,
      },
    });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
      },
    });
  }

  return user;
};
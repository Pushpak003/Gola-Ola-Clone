import prisma from "../config/db.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendSMS } from "../services/sms.service.js";

export const sendOTPService = async (phone) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidate any previously unconsumed OTPs for this phone (cleanup)
  await prisma.oTP.updateMany({
    where: { phone, consumed: false },
    data: { consumed: true },
  });

  await prisma.oTP.create({
    data: { phone, code: otp, expiresAt },
  });

  await sendSMS(phone, otp);
  console.log("OTP:", otp);

  return otp;
};

export const verifyOTPService = async (phone, otp) => {
  const otpRecord = await prisma.oTP.findFirst({
    where: { phone, code: String(otp), consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) throw new Error("Invalid OTP");
  if (new Date() > otpRecord.expiresAt) throw new Error("OTP Expired");

  // Mark as consumed so it can't be replayed
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { consumed: true },
  });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone } });
  }

  return user;
};
import prisma from "../config/db.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendSMS } from "../services/sms.service.js";

export const sendCaptainOTPService = async (phone) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidate any previously unconsumed OTPs for this phone
  await prisma.oTP.updateMany({
    where: { phone, consumed: false },
    data: { consumed: true },
  });

  await prisma.oTP.create({ data: { phone, code: otp, expiresAt } });
  await sendSMS(phone, otp);
  console.log("Captain OTP:", otp);
};

export const verifyCaptainOTPService = async (phone, otp) => {
  const otpRecord = await prisma.oTP.findFirst({
    where: { phone, code: String(otp), consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) throw new Error("Invalid OTP");
  if (new Date() > otpRecord.expiresAt) throw new Error("OTP Expired");

  // Mark consumed — prevents replay
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { consumed: true },
  });

  const captain = await prisma.captain.findUnique({ where: { phone } });
  return captain; // null = onboarding required
};
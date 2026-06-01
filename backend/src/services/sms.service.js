import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your Gola OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });

    console.log("SMS SENT via Twilio =>", message.sid);
  } catch (error) {
    console.log("TWILIO ERROR =>", error.message);
    throw new Error("Failed to send SMS: " + error.message);
  }
};
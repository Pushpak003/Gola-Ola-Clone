import axios from "axios";

export const sendSMS = async (phone, otp) => {
  try {
    await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        mobile: `91${phone}`,
        otp,
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
        },
      }
    );

    console.log("SMS SENT");
  } catch (error) {
    console.log(
      "MSG91 ERROR =>",
      error.response?.data || error.message
    );
  }
};
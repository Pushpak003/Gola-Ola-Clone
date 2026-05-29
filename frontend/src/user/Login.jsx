import { useState, useEffect } from "react";
import api from "../api/axios";
import { socket } from "../sockets/socket.js";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (token) {
      navigate("/home");
    }
  }, []);
  const sendOTP = async () => {
     console.log("BUTTON CLICKED");
    try {
        console.log("API CALL STARTING");
      await api.post("/auth/send-otp", {
        phone,
      });

      setOtpSent(true);

      alert("OTP Sent");
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await api.post("/auth/verify-otp", {
        phone,
        otp,
      });
      console.log("API SUCCESS");
      const token = response.data.token;

      localStorage.setItem("userToken", token);

      // Socket connect
      socket.connect();

      socket.emit("user-online", {
        token,
      });

      alert("Login Success");
      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>User Login</h1>

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {!otpSent ? (
        <button onClick={sendOTP}>Send OTP</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={verifyOTP}>Verify OTP</button>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; 
import { socket } from "../sockets/socket.js"; // 🌟 FIX: Yeh import miss ho raha tha jisse Vite crash hua!

const UserLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Agar user pehle se logged in hai, toh directly home bhejo
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "user") {
      navigate("/home");
    }
  }, [navigate]);

  // Step 1: Send OTP to Backend
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10)
      return setError("Valid phone number daalo bhai!");

    setError("");
    setLoading(true);
    try {
      await API.post("/auth/send-otp", { phone: phoneNumber });
      setIsOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "OTP bhejne me dikkat aayi.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Save Token
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return setError("Poora OTP daalo.");

    setError("");
    setLoading(true);
    try {
      const response = await API.post("/auth/verify-otp", {
        phone: phoneNumber,
        otp: otp,
      });

      if (response.data.token) {
        const userToken = response.data.token;

        // Local storage setup with strict 'token' key
        localStorage.setItem("token", userToken);
        localStorage.setItem("role", "user");

        // Real-time socket authentication trigger
        socket.connect();
        socket.emit("user-online", { token: userToken });
        console.log("USER LOGGED IN & SOCKET EMITTED SUCCESSFULLY");
        
        navigate("/home");
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Invalid OTP. Phir se try karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-white p-6 font-sans">
      <div>
        {/* Brand Logo */}
        <h2 className="text-3xl font-extrabold tracking-wider mb-8 text-black">
          GOLA
        </h2>

        <div className="space-y-2 mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {isOtpSent ? "Enter verification code" : "What's your number?"}
          </h3>
          <p className="text-sm text-gray-500">
            {isOtpSent
              ? `We sent an OTP to +91 ${phoneNumber}`
              : "Sign in to book your flexible Gola rides."}
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 font-medium">⚠️ {error}</p>
        )}

        {!isOtpSent ? (
          /* Phone Number Form */
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-3 border focus-within:border-black transition">
              <span className="text-gray-600 font-semibold border-r border-gray-300 pr-3 mr-3">
                +91
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter mobile number"
                maxLength={10}
                className="bg-transparent w-full focus:outline-none text-base font-medium tracking-wide"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-gray-950 transition active:scale-98 disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </form>
        ) : (
          /* OTP Form */
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 4 or 6 digit OTP"
              maxLength={6}
              className="w-full bg-gray-100 px-4 py-3.5 rounded-lg text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-gray-950 transition active:scale-98 disabled:bg-gray-400"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              className="text-xs text-center w-full block text-gray-500 font-medium hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>

      {/* Bottom Disclaimer & Flow switch */}
      <div className="text-center space-y-4">
        <p className="text-[11px] text-gray-400 px-4">
          By proceeding, you consent to receive SMS or WhatsApp notifications
          from Gola.
        </p>
        <div
          onClick={() => navigate("/captain/login")}
          className="w-full border border-gray-300 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer text-center transition"
        >
          Sign in as Captain 🏍️
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
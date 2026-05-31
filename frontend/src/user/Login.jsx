import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { socket } from "../sockets/socket.js";
import "./Auth.css";

const UserLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "user") navigate("/home");
  }, [navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return setError("Enter a valid 10-digit number");
    setError(""); setLoading(true);
    try {
      await API.post("/auth/send-otp", { phone: phoneNumber });
      setIsOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return setError("Enter complete OTP");
    setError(""); setLoading(true);
    try {
      const response = await API.post("/auth/verify-otp", { phone: phoneNumber, otp });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "user");
        socket.connect();
        socket.emit("user-online", { token: response.data.token });
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth">
      <div className="auth__top">
        <div className="auth__logo">GOLA</div>
      </div>

      <div className="auth__body animate-fade-up">
        <div className="auth__header">
          <h1 className="auth__title">
            {isOtpSent ? "Enter OTP" : "Welcome back"}
          </h1>
          <p className="auth__desc">
            {isOtpSent
              ? `Sent to +91 ${phoneNumber}`
              : "Sign in to book your next ride"}
          </p>
        </div>

        {error && <div className="auth__error">⚠️ {error}</div>}

        {!isOtpSent ? (
          <form onSubmit={handleSendOTP} className="auth__form">
            <div className="auth__field">
              <span className="auth__prefix">+91</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Mobile number"
                maxLength={10}
                className="auth__input"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="auth__btn" disabled={loading}>
              {loading ? <span className="auth__spinner" /> : "Continue →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth__form">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="• • • • • •"
              maxLength={6}
              className="auth__input auth__input--otp"
              required
              autoFocus
            />
            <button type="submit" className="auth__btn" disabled={loading}>
              {loading ? <span className="auth__spinner" /> : "Verify & Login"}
            </button>
            <button type="button" className="auth__link" onClick={() => setIsOtpSent(false)}>
              ← Change number
            </button>
          </form>
        )}
      </div>

      <div className="auth__footer">
        <p className="auth__footer-text">By proceeding, you agree to receive SMS from Gola</p>
        <div className="auth__switch" onClick={() => navigate("/captain/login")}>
          Sign in as Captain 🏍️
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
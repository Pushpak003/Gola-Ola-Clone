import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../user/Auth.css";
import "./Captain.css";

export default function CaptainLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return setError("Enter a valid 10-digit number");
    setError("");
    setLoading(true);
    try {
      await api.post("/captain/send-otp", { phone });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return setError("Enter complete OTP");
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/captain/verify-otp", { phone, otp });
      const { token, captain, onboardingRequired, phone: serverPhone } = response.data;

      if (onboardingRequired) {
        localStorage.setItem("captainPhone", phone);
        navigate("/captain/complete-profile");
        return;
      }

      localStorage.setItem("captainToken", token);
      localStorage.setItem("token", token);
      localStorage.setItem("role", "captain");
      navigate("/captain/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__top">
        <div className="auth__logo">GOLA</div>
        <div className="captain-badge">Captain Portal</div>
      </div>

      <div className="auth__body animate-fade-up">
        <div className="auth__header">
          <h1 className="auth__title">
            {otpSent ? "Enter OTP" : "Captain Login"}
          </h1>
          <p className="auth__desc">
            {otpSent
              ? `Sent to +91 ${phone}`
              : "Sign in to start accepting rides"}
          </p>
        </div>

        {error && <div className="auth__error">⚠️ {error}</div>}

        {!otpSent ? (
          <form onSubmit={sendOTP} className="auth__form">
            <div className="auth__field">
              <span className="auth__prefix">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Mobile number"
                maxLength={10}
                className="auth__input"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="auth__btn captain-btn"
              disabled={loading}
            >
              {loading ? <span className="auth__spinner" /> : "Send OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="auth__form">
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
            <button
              type="submit"
              className="auth__btn captain-btn"
              disabled={loading}
            >
              {loading ? <span className="auth__spinner" /> : "Verify & Login"}
            </button>
            <button
              type="button"
              className="auth__link"
              onClick={() => setOtpSent(false)}
            >
              ← Change number
            </button>
          </form>
        )}
      </div>

      <div className="auth__footer">
        <p className="auth__footer-text">For registered Gola captains only</p>
        <div className="auth__switch" onClick={() => navigate("/login")}>
          Book a ride as User 🚕
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CaptainLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    try {
      setLoading(true);

      await api.post("/captain/send-otp", {
        phone,
      });

      setOtpSent(true);
      alert("OTP Sent");
    } catch (error) {
      console.log(error);
      alert("OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/captain/verify-otp",
        {
          phone,
          otp,
        }
      );

      const token = response.data.token;
      const captain = response.data.captain;

      localStorage.setItem(
        "captainToken",
        token
      );

      localStorage.setItem(
        "role",
        "captain"
      );

      const profileCompleted =
        captain?.fullname &&
        captain?.vehicleType &&
        captain?.vehicleNumber;

      if (!profileCompleted) {
        navigate(
          "/captain/complete-profile"
        );
      } else {
        navigate(
          "/captain/dashboard"
        );
      }
    } catch (error) {
      console.log(error);
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <h1>
        Captain Login
      </h1>

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) =>
          setPhone(
            e.target.value
          )
        }
      />

      {!otpSent ? (
        <button
          onClick={sendOTP}
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send OTP"}
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
              )
            }
          />

          <button
            onClick={verifyOTP}
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
}
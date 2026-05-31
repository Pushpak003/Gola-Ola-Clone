import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../sockets/socket.js";
import "./Captain.css";

export default function CaptainLiveRide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ride = state?.ride;

  const [rideStarted, setRideStarted] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const locationIntervalRef = useRef(null);

  // Start sending captain location updates to user
  useEffect(() => {
    if (!ride?.id) return;

    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit("captain-location", {
          rideId: ride.id,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }, 3000);

    return () => clearInterval(locationIntervalRef.current);
  }, [ride?.id]);

  const startRide = async () => {
    if (!otp) return setError("Enter OTP from passenger");
    setError(""); setLoading(true);
    try {
      await api.post("/ride/start", { rideId: ride?.id, otp });
      setRideStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Ask passenger again.");
    } finally { setLoading(false); }
  };

  const completeRide = async () => {
    setLoading(true);
    try {
      await api.post("/ride/complete", { rideId: ride?.id });
      clearInterval(locationIntervalRef.current);
      navigate("/captain/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete ride");
    } finally { setLoading(false); }
  };

  return (
    <div className="clive">
      <div className="clive__header">
        <span className="clive__logo">GOLA</span>
        <span className="clive__tag">{rideStarted ? "🚀 In Progress" : "⏳ Pick Up Pending"}</span>
      </div>

      <div className="clive__body">
        <div className="clive__card">
          {/* Route */}
          <div className="clive__route">
            <div className="clive__route-item">
              <span className="clive__route-dot clive__route-dot--pickup" />
              <div>
                <div className="clive__route-label">Pickup</div>
                <div className="clive__route-name">{ride?.pickup}</div>
              </div>
            </div>
            <div style={{ width: 2, height: 16, background: 'var(--gray-200)', marginLeft: 4, marginTop: 2 }} />
            <div className="clive__route-item">
              <span className="clive__route-dot clive__route-dot--drop" />
              <div>
                <div className="clive__route-label">Drop</div>
                <div className="clive__route-name">{ride?.destination}</div>
              </div>
            </div>
          </div>

          {/* Fare */}
          <div className="clive__fare">
            <span className="clive__fare-key">Ride Fare</span>
            <span className="clive__fare-val">₹{ride?.fare ? Math.round(ride.fare) : "—"}</span>
          </div>

          {/* Vehicle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1.5px solid var(--gray-100)', marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>
              {ride?.vehicleType === "BIKE" ? "🏍️" : ride?.vehicleType === "AUTO" ? "🛺" : "🚗"}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' }}>{ride?.vehicleType}</span>
          </div>

          {error && (
            <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 500, background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {!rideStarted ? (
            <div className="clive__otp-input-wrap">
              <div className="clive__otp-input-label">Ask passenger for their OTP to start ride:</div>
              <input
                className="clive__otp-field"
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
              />
              <button className="clive__start-btn" onClick={startRide} disabled={loading}>
                {loading ? "Verifying..." : "✓ Start Ride"}
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>
                🚗 Ride in progress — drive safe!
              </div>
              <button className="clive__complete-btn" onClick={completeRide} disabled={loading}>
                {loading ? "Completing..." : "🏁 Complete Ride"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
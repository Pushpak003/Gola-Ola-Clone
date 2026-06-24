import { useLocation, useNavigate } from "react-router-dom";
import { captainAPI as api } from "../api/axios";
import { useState } from "react";
import "./Captain.css";

export default function IncomingRide() {
  const { state } = useLocation();
  console.log("Incoming Ride State:", state);
  const navigate = useNavigate();
  const ride = state?.ride;
  const [loading, setLoading] = useState(false);

  const acceptRide = async () => {
    if (!ride?.id) return alert("Ride data missing!");
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post("/ride/accept", { rideId: ride.id });
      if (res.data?.success) {
        navigate("/live-ride", { state: { ride: res.data.ride } });
      } else {
        alert(res.data?.message || "Failed to accept ride");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept ride. Try again.");
      setLoading(false);
    }
  };

  const rejectRide = () => {
    navigate("/dashboard");
  };

  return (
    <div className="incoming">
      <div className="incoming__top">
        <div className="incoming__logo">GOLA</div>
        <div className="incoming__headline">⚡ New Ride Request</div>
      </div>

      <div className="incoming__card">
        {/* Route */}
        <div className="incoming__route">
          <div className="incoming__route-line" />
          <div className="incoming__point">
            <div className="incoming__dot incoming__dot--pickup">A</div>
            <div>
              <div className="incoming__point-label">Pickup</div>
              <div className="incoming__point-name">
                {ride?.pickup || "Pickup Location"}
              </div>
            </div>
          </div>
          <div className="incoming__point">
            <div className="incoming__dot incoming__dot--drop">B</div>
            <div>
              <div className="incoming__point-label">Drop</div>
              <div className="incoming__point-name">
                {ride?.destination || "Destination"}
              </div>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="incoming__meta">
          <div className="incoming__meta-item">
            <div className="incoming__meta-val">₹{ride?.fare ? Math.round(ride.fare) : "—"}</div>
            <div className="incoming__meta-key">Fare</div>
          </div>
          <div className="incoming__meta-item">
            <div className="incoming__meta-val">
              {ride?.vehicleType === "BIKE"
                ? "🏍️"
                : ride?.vehicleType === "AUTO"
                  ? "🛺"
                  : "🚗"}
            </div>
            <div className="incoming__meta-key">
              {ride?.vehicleType || "Vehicle"}
            </div>
          </div>
          <div className="incoming__meta-item">
            <div className="incoming__meta-val">{ride?.distance ? `${(ride.distance / 1000).toFixed(1)} km` : "—"}</div>
            <div className="incoming__meta-key">Distance</div>
          </div>
        </div>

        {/* Actions */}
        <div className="incoming__actions">
          <button
            className="incoming__accept"
            onClick={acceptRide}
            disabled={loading}
          >
            {loading ? "..." : "✓ Accept"}
          </button>
          <button className="incoming__reject" onClick={rejectRide}>
            ✕ Decline
          </button>
        </div>
      </div>
    </div>
  );
}

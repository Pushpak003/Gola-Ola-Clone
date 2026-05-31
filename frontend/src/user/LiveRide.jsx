import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket.js";
import "./Ride.css";

export default function LiveRide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [rideStatus, setRideStatus] = useState("ACCEPTED"); // ACCEPTED -> STARTED -> COMPLETED
  const [captainLocation, setCaptainLocation] = useState(null);

  useEffect(() => {
    const onRideCompleted = () => {
      setRideStatus("COMPLETED");
    };

    // captain-location-update: { rideId, lat, lng }
    const onCaptainLocation = (data) => {
      setCaptainLocation({ lat: data.lat, lng: data.lng });
    };

    socket.on("ride-completed", onRideCompleted);
    socket.on("captain-location-update", onCaptainLocation);

    return () => {
      socket.off("ride-completed", onRideCompleted);
      socket.off("captain-location-update", onCaptainLocation);
    };
  }, []);

  if (rideStatus === "COMPLETED") {
    return (
      <div className="liveride liveride--done">
        <div className="liveride__done-icon">🎉</div>
        <h1 className="liveride__done-title">Ride Complete!</h1>
        <p className="liveride__done-sub">Hope you had a great trip with Gola.</p>
        <div className="liveride__done-fare">
          <span className="liveride__done-fare-label">Total Paid</span>
          <span className="liveride__done-fare-val">₹{state?.fare ? Math.round(state.fare) : "—"}</span>
        </div>
        <div className="liveride__done-rating">
          <p className="liveride__done-rating-label">Rate your ride</p>
          <div className="liveride__stars">
            {[1,2,3,4,5].map(s => <span key={s} className="liveride__star">★</span>)}
          </div>
        </div>
        <button className="liveride__home-btn" onClick={() => navigate("/home")}>
          Back to Home →
        </button>
      </div>
    );
  }

  const vehicleEmoji = state?.vehicleType === "BIKE" ? "🏍️" : state?.vehicleType === "AUTO" ? "🛺" : "🚗";

  return (
    <div className="liveride">
      <div className="liveride__header">
        <span className="liveride__logo">GOLA</span>
        <span className="liveride__tag">
          {rideStatus === "ACCEPTED" ? "⏳ Captain En Route" : "🚀 Ride In Progress"}
        </span>
      </div>

      <div className="liveride__body">
        {/* Captain card */}
        <div className="liveride__captain-card animate-fade-up">
          <div className="liveride__captain-avatar">{vehicleEmoji}</div>
          <div className="liveride__captain-info">
            <div className="liveride__captain-name">Your Captain</div>
            <div className="liveride__captain-vehicle">
              {captainLocation
                ? `📍 ${captainLocation.lat.toFixed(4)}, ${captainLocation.lng.toFixed(4)}`
                : "Heading towards you..."}
            </div>
          </div>
          <div className="liveride__captain-fare">₹{state?.fare ? Math.round(state.fare) : "—"}</div>
        </div>

        {/* OTP — show only when captain hasn't picked up yet */}
        {rideStatus === "ACCEPTED" && (
          <div className="liveride__otp-card animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="liveride__otp-label">Show this OTP to your captain</div>
            <div className="liveride__otp">{state?.otp || "— — — —"}</div>
            <div className="liveride__otp-hint">Captain will enter this to start your ride</div>
          </div>
        )}

        {/* Route */}
        <div className="liveride__route animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="liveride__route-item">
            <div className="liveride__route-dot liveride__route-dot--pickup" />
            <div>
              <div className="liveride__route-label">Pickup</div>
              <div className="liveride__route-name">{state?.pickup}</div>
            </div>
          </div>
          <div className="liveride__route-connector" />
          <div className="liveride__route-item">
            <div className="liveride__route-dot liveride__route-dot--drop" />
            <div>
              <div className="liveride__route-label">Destination</div>
              <div className="liveride__route-name">{state?.destination}</div>
            </div>
          </div>
        </div>

        {/* Safety note */}
        <div className="liveride__safety animate-fade-up" style={{ animationDelay: "0.3s" }}>
          🔒 Share OTP only with your captain at pickup
        </div>
      </div>
    </div>
  );
}
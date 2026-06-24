import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket.js";
import "./Ride.css";

export default function SearchingRide() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Backend emits ride-confirmed with full updatedRide object (no captain included)
    // We navigate to live-ride and pass otp from state (created at ride creation time)
    const onRideConfirmed = (ride) => {
      console.log("ride-confirmed received:", ride);
      navigate("/user/live-ride", {
        state: {
          rideId: ride.id,
          pickup: ride.pickup,
          destination: ride.destination,
          fare: ride.fare,
          otp: ride.otp,
          vehicleType: ride.vehicleType,
          captainId: ride.captainId,
          // Pass coordinates so LiveRide map can draw route & place markers
          pickupLat: state?.pickupLat || ride.pickupLat,
          pickupLng: state?.pickupLng || ride.pickupLng,
          destinationLat: state?.destinationLat || ride.destinationLat,
          destinationLng: state?.destinationLng || ride.destinationLng,
        },
      });
    };

    socket.on("ride-confirmed", onRideConfirmed);
    return () => socket.off("ride-confirmed", onRideConfirmed);
  }, [navigate]);

  const handleCancel = () => {
    navigate("/home");
  };

  return (
    <div className="searching">
      <div className="searching__header">
        <span className="searching__logo">GOLA</span>
      </div>

      <div className="searching__anim">
        <div className="searching__ring" />
        <div className="searching__ring" />
        <div className="searching__ring" />
        <span className="searching__emoji">🚕</span>
      </div>

      <h2 className="searching__title">Finding your captain</h2>
      <p className="searching__sub">
        Looking for nearby drivers around{" "}
        <strong style={{ color: "var(--black)" }}>{state?.pickup}</strong>
      </p>

      <div className="searching__brief">
        <div className="searching__brief-header">
          <span className="searching__vtype">
            {state?.vehicleType === "BIKE" ? "🏍️ Moto" : state?.vehicleType === "AUTO" ? "🛺 Auto" : "🚗 Mini"}
          </span>
          <span className="searching__fare">₹{state?.fare ? Math.round(state.fare) : "—"}</span>
        </div>
        <div className="searching__brief-route">
          <div className="searching__route-item">
            <span className="searching__route-dot searching__route-dot--g" />
            <span className="searching__route-text">{state?.pickup}</span>
          </div>
          <div className="searching__route-item">
            <span className="searching__route-dot searching__route-dot--r" />
            <span className="searching__route-text">{state?.destination}</span>
          </div>
        </div>
      </div>

      <button className="searching__cancel" onClick={handleCancel}>
        Cancel Request
      </button>
    </div>
  );
}
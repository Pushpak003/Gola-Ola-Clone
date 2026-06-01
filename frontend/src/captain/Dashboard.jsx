import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket";
import "./Captain.css";

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();
  // No location interval here — location is only emitted during an active ride (CaptainLiveRide page)

  const goOnline = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        socket.connect();
        socket.emit("captain-online", {
          token: localStorage.getItem("captainToken"),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        // FIX: do NOT add socket.on("new-ride") here — it's already in useEffect below
        // Adding it here creates duplicate listeners every time Go Online is clicked
        setIsOnline(true);
      },
      () => alert("Location permission required to go online")
    );
  };

  const goOffline = () => {
    socket.disconnect();
    setIsOnline(false);
  };

  useEffect(() => {
    // Single listener — no duplicates
    const onNewRide = (ride) => {
      console.log("NEW RIDE =>", ride);
      navigate("/captain/incoming-ride", { state: { ride } });
    };
    socket.on("new-ride", onNewRide);
    return () => socket.off("new-ride", onNewRide);
  }, [navigate]);

  const handleLogout = () => {
    if (isOnline) socket.disconnect();
    localStorage.removeItem("captainToken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/captain/login");
  };

  return (
    <div className="cdash">
      <div className="cdash__header">
        <span className="cdash__logo">GOLA</span>
        <div className="cdash__status-pill">
          <span className={`cdash__status-dot ${isOnline ? "cdash__status-dot--online" : ""}`} />
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>

      <div className="cdash__body">
        <div className="cdash__ring-wrap">
          {isOnline && (
            <>
              <div className="cdash__ring-pulse" />
              <div className="cdash__ring-pulse" />
            </>
          )}
          <div className={`cdash__ring ${isOnline ? "cdash__ring--online" : ""}`}>
            <span className="cdash__icon">{isOnline ? "🟢" : "🏍️"}</span>
            <span className="cdash__ring-label">{isOnline ? "Accepting" : "Offline"}</span>
          </div>
        </div>

        <div className="cdash__info">
          <h2 className="cdash__info-title">
            {isOnline ? "Waiting for rides..." : "Ready to earn?"}
          </h2>
          <p className="cdash__info-sub">
            {isOnline
              ? "You'll be notified instantly when a nearby rider requests a trip."
              : "Go online to start receiving ride requests in your area."}
          </p>
        </div>

        {!isOnline ? (
          <button className="cdash__btn cdash__btn--go" onClick={goOnline}>
            🟢 Go Online
          </button>
        ) : (
          <button className="cdash__btn cdash__btn--off" onClick={goOffline}>
            ⛔ Go Offline
          </button>
        )}
      </div>

      <div className="cdash__footer">
        <button className="cdash__history" onClick={() => navigate("/captain/history")}>
          Ride History
        </button>
        <button className="cdash__logout" onClick={handleLogout}>Sign out</button>
      </div>
    </div>
  );
}
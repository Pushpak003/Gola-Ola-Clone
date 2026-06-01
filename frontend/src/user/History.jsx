import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./History.css";

const statusColor = { COMPLETED: "green", CANCELLED: "red", SEARCHING: "yellow", ACCEPTED: "blue", STARTED: "blue" };
const statusLabel = { COMPLETED: "Completed", CANCELLED: "Cancelled", SEARCHING: "Searching", ACCEPTED: "Accepted", STARTED: "In Progress" };
const vehicleEmoji = { BIKE: "🏍️", AUTO: "🛺", MINI: "🚗", SEDAN: "🚙", SUV: "🚐" };

export default function UserHistory() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ride/history")
      .then(({ data }) => { if (data?.success) setRides(data.rides); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="hist">
      <div className="hist__header">
        <button className="hist__back" onClick={() => navigate("/home")}>←</button>
        <h1 className="hist__title">Your Rides</h1>
        <div style={{ width: 38 }} />
      </div>

      {loading ? (
        <div className="hist__loading"><div className="hist__spin" /><p>Loading rides...</p></div>
      ) : rides.length === 0 ? (
        <div className="hist__empty">
          <span className="hist__empty-icon">🚕</span>
          <h3>No rides yet</h3>
          <p>Your ride history will appear here.</p>
          <button className="hist__book-btn" onClick={() => navigate("/home")}>Book your first ride →</button>
        </div>
      ) : (
        <div className="hist__list">
          {rides.map((ride) => (
            <div key={ride.id} className="hist__card">
              <div className="hist__card-top">
                <div className="hist__vehicle">{vehicleEmoji[ride.vehicleType] || "🚗"}</div>
                <div className="hist__card-info">
                  <div className="hist__card-date">
                    {new Date(ride.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className={`hist__status hist__status--${statusColor[ride.status]}`}>
                    {statusLabel[ride.status]}
                  </div>
                </div>
                <div className="hist__fare">₹{Math.round(ride.fare)}</div>
              </div>

              <div className="hist__route">
                <div className="hist__rrow">
                  <span className="hist__rdot hist__rdot--g" />
                  <span className="hist__rtext">{ride.pickup}</span>
                </div>
                <div className="hist__rline" />
                <div className="hist__rrow">
                  <span className="hist__rdot hist__rdot--r" />
                  <span className="hist__rtext">{ride.destination}</span>
                </div>
              </div>

              {ride.captain && (
                <div className="hist__captain">
                  <span className="hist__captain-label">Captain:</span>
                  <span className="hist__captain-name">{ride.captain.fullname}</span>
                  <span className="hist__captain-vehicle">{ride.captain.vehicleNumber}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
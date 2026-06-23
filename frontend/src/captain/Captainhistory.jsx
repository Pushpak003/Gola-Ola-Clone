import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { captainAPI as api } from "../api/axios";
import "../user/History.css";

const statusColor = { COMPLETED: "green", CANCELLED: "red", STARTED: "blue", ACCEPTED: "blue" };
const statusLabel = { COMPLETED: "Completed", CANCELLED: "Cancelled", STARTED: "In Progress", ACCEPTED: "Accepted" };
const vehicleEmoji = { BIKE: "🏍️", AUTO: "🛺", MINI: "🚗", SEDAN: "🚙", SUV: "🚐" };

export default function CaptainHistory() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ride/captainhistory")
      .then(({ data }) => { if (data?.success) setRides(data.rides); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = rides.filter(r => r.status === "COMPLETED").reduce((sum, r) => sum + r.fare, 0);

  return (
    <div className="hist">
      <div className="hist__header">
        <button className="hist__back" onClick={() => navigate("/dashboard")}>←</button>
        <h1 className="hist__title">Ride History</h1>
        <div style={{ width: 38 }} />
      </div>

      {!loading && rides.length > 0 && (
        <div className="hist__summary">
          <div className="hist__summary-item">
            <span className="hist__summary-val">{rides.filter(r => r.status === "COMPLETED").length}</span>
            <span className="hist__summary-key">Completed</span>
          </div>
          <div className="hist__summary-divider" />
          <div className="hist__summary-item">
            <span className="hist__summary-val">₹{Math.round(totalEarned)}</span>
            <span className="hist__summary-key">Total Earned</span>
          </div>
          <div className="hist__summary-divider" />
          <div className="hist__summary-item">
            <span className="hist__summary-val">{rides.length}</span>
            <span className="hist__summary-key">Total Rides</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="hist__loading"><div className="hist__spin" /><p>Loading rides...</p></div>
      ) : rides.length === 0 ? (
        <div className="hist__empty">
          <span className="hist__empty-icon">🏍️</span>
          <h3>No rides yet</h3>
          <p>Go online to start accepting rides.</p>
          <button className="hist__book-btn" onClick={() => navigate("/dashboard")}>Go to Dashboard →</button>
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

              {ride.user && (
                <div className="hist__captain">
                  <span className="hist__captain-label">Passenger:</span>
                  <span className="hist__captain-name">{ride.user.phone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Captain.css";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [vehicleType, setVehicleType] = useState("BIKE");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const VEHICLES = [
    { id: "BIKE", icon: "🏍️", name: "Bike" },
    { id: "AUTO", icon: "🛺", name: "Auto" },
    { id: "MINI", icon: "🚗", name: "Mini" },
  ];

  const handleSubmit = async () => {
    if (!fullname.trim()) return setError("Enter your full name");
    if (!vehicleNumber.trim()) return setError("Enter vehicle number");
    setError(""); setLoading(true);
    try {
      await api.post("/captain/complete-profile", {
        fullname,
        vehicleType,
        vehicleNumber,
      });
      navigate("/captain/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__logo">GOLA</div>
        <h1 className="profile__title">Complete your profile</h1>
      </div>

      <div className="profile__body animate-fade-up">
        {error && (
          <div style={{ background: '#fff5f5', border: '1.5px solid #fed7d7', color: 'var(--red)', fontSize: 13, fontWeight: 500, padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="profile__field">
          <label className="profile__label">Full Name</label>
          <input className="profile__input" type="text" placeholder="Your full name" value={fullname} onChange={(e) => setFullname(e.target.value)} autoFocus />
        </div>

        <div className="profile__field">
          <label className="profile__label">Vehicle Type</label>
          <div className="profile__vehicles">
            {VEHICLES.map((v) => (
              <div
                key={v.id}
                className={`profile__vehicle-opt ${vehicleType === v.id ? "profile__vehicle-opt--selected" : ""}`}
                onClick={() => setVehicleType(v.id)}
              >
                <span className="profile__vehicle-icon">{v.icon}</span>
                <span className="profile__vehicle-name">{v.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="profile__field">
          <label className="profile__label">Vehicle Number</label>
          <input
            className="profile__input"
            type="text"
            placeholder="e.g. MP04 AB 1234"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
          />
        </div>

        <button className="profile__submit" onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="g-spinner" /> : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}
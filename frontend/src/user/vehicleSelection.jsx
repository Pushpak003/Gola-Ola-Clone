import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./VehicleSelection.css";

const RIDE_OPTIONS = [
  { id: "BIKE",  emoji: "🏍️", name: "Gola Moto",   tag: "Fastest",  tagColor: "green",  seats: 1, eta: "2 min", desc: "Beat city traffic" },
  { id: "AUTO",  emoji: "🛺",  name: "Gola Auto",   tag: "Budget",   tagColor: "yellow", seats: 3, eta: "3 min", desc: "Affordable, open-air" },
  { id: "MINI",  emoji: "🚗",  name: "Gola Mini",   tag: "Popular",  tagColor: "gray",   seats: 4, eta: "4 min", desc: "Compact everyday car" },
  { id: "SEDAN", emoji: "🚙",  name: "Gola Sedan",  tag: "Comfort",  tagColor: "blue",   seats: 4, eta: "5 min", desc: "Spacious & smooth" },
  { id: "SUV",   emoji: "🚐",  name: "Gola SUV",    tag: "Premium",  tagColor: "purple", seats: 6, eta: "6 min", desc: "For those who travel big" },
];

export default function VehicleSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [fares, setFares] = useState(null);
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state?.pickupLocation || !state?.destinationLocation) { navigate("/home"); return; }
    api.get("/ride/fare", {
      params: {
        pickupLat: state.pickupLocation.lat,
        pickupLng: state.pickupLocation.lng,
        destinationLat: state.destinationLocation.lat,
        destinationLng: state.destinationLocation.lng,
      },
    }).then(({ data }) => {
      if (data?.success && data?.data?.fares) setFares(data.data.fares);
      else setError("Could not load fares.");
    }).catch(() => setError("Failed to fetch fares."));
  }, [state, navigate]);

  const handleBook = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      const { data } = await api.post("/ride/create", {
        pickup: state.pickupLocation.name,
        destination: state.destinationLocation.name,
        pickupLat: Number(state.pickupLocation.lat),
        pickupLng: Number(state.pickupLocation.lng),
        destinationLat: Number(state.destinationLocation.lat),
        destinationLng: Number(state.destinationLocation.lng),
        vehicleType: selected,
      });
      if (data?.success) {
        navigate("/user/searching-ride", {
          state: {
            rideId: data.ride.id,
            pickup: state.pickupLocation.name,
            destination: state.destinationLocation.name,
            pickupLat: state.pickupLocation.lat,
            pickupLng: state.pickupLocation.lng,
            destinationLat: state.destinationLocation.lat,
            destinationLng: state.destinationLocation.lng,
            fare: fares[selected],
            vehicleType: selected,
            otp: data.ride.otp,
          },
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed.");
    } finally { setBooking(false); }
  };

  if (error) return (
    <div className="vsel vsel--err">
      <p>⚠️ {error}</p>
      <button onClick={() => navigate("/home")}>← Go Back</button>
    </div>
  );

  if (!fares) return (
    <div className="vsel vsel--loading">
      <div className="vsel__spin" />
      <p>Calculating fares...</p>
    </div>
  );

  const selectedOption = RIDE_OPTIONS.find(o => o.id === selected);

  return (
    <div className="vsel">
      <div className="vsel__header">
        <button className="vsel__back" onClick={() => navigate("/home")}>←</button>
        <span className="vsel__title">Choose a ride</span>
        <div style={{ width: 38 }} />
      </div>

      <div className="vsel__route">
        <div className="vsel__route-row">
          <span className="vsel__rdot vsel__rdot--g" />
          <span className="vsel__rname">{state?.pickupLocation?.name}</span>
        </div>
        <div className="vsel__rline" />
        <div className="vsel__route-row">
          <span className="vsel__rdot vsel__rdot--r" />
          <span className="vsel__rname">{state?.destinationLocation?.name}</span>
        </div>
      </div>

      <div className="vsel__list">
        {RIDE_OPTIONS.map((opt, i) => {
          const price = fares[opt.id];
          const isSelected = selected === opt.id;
          return (
            <div
              key={opt.id}
              className={`vsel__card ${isSelected ? "vsel__card--on" : ""}`}
              onClick={() => setSelected(opt.id)}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="vsel__card-emoji">{opt.emoji}</div>
              <div className="vsel__card-info">
                <div className="vsel__card-top">
                  <span className="vsel__card-name">{opt.name}</span>
                  <span className={`vsel__card-tag vsel__card-tag--${opt.tagColor}`}>{opt.tag}</span>
                </div>
                <div className="vsel__card-meta">
                  <span>⏱ {opt.eta}</span>
                  <span>·</span>
                  <span>👤 {opt.seats}</span>
                  <span>·</span>
                  <span>{opt.desc}</span>
                </div>
              </div>
              <div className="vsel__card-price">₹{price ? Math.round(price) : "—"}</div>
              {isSelected && <div className="vsel__check">✓</div>}
            </div>
          );
        })}
      </div>

      <div className="vsel__footer">
        <button
          className={`vsel__book ${selected ? "vsel__book--on" : ""}`}
          onClick={handleBook}
          disabled={!selected || booking}
        >
          {booking
            ? <><span className="g-spinner" /> Booking...</>
            : selected
              ? `Book ${selectedOption?.name} → ₹${Math.round(fares[selected])}`
              : "Select a vehicle"
          }
        </button>
      </div>
    </div>
  );
}
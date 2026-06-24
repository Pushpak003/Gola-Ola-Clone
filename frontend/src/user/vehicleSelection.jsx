import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userAPI as api } from "../api/axios";
import "./VehicleSelection.css";

const RIDE_OPTIONS = [
  { id: "BIKE",  emoji: "🏍️", name: "Gola Moto",  tag: "Fastest",  tagColor: "green",  seats: 1, eta: "2 min", desc: "Beat city traffic" },
  { id: "AUTO",  emoji: "🛺",  name: "Gola Auto",  tag: "Budget",   tagColor: "yellow", seats: 3, eta: "3 min", desc: "Affordable, open-air" },
  { id: "MINI",  emoji: "🚗",  name: "Gola Mini",  tag: "Popular",  tagColor: "gray",   seats: 4, eta: "4 min", desc: "Compact everyday car" },
  { id: "SEDAN", emoji: "🚙",  name: "Gola Sedan", tag: "Comfort",  tagColor: "blue",   seats: 4, eta: "5 min", desc: "Spacious & smooth" },
  { id: "SUV",   emoji: "🚐",  name: "Gola SUV",   tag: "Premium",  tagColor: "purple", seats: 6, eta: "6 min", desc: "For those who travel big" },
];

export default function VehicleSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [fares, setFares] = useState(null);
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  // Recover state from sessionStorage if React Router state is lost
  // (happens on Strict Mode double-render or page refresh)
  const locationState = state || (() => {
    try {
      const saved = sessionStorage.getItem("vsel_state");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();

  // Save state to sessionStorage whenever we have valid state
  useEffect(() => {
    if (state?.pickupLocation && state?.destinationLocation) {
      sessionStorage.setItem("vsel_state", JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    if (!locationState?.pickupLocation || !locationState?.destinationLocation) {
      navigate("/home");
      return;
    }

    setError("");
    setFares(null);

    api
      .get("/ride/fare", {
        params: {
          pickupLat: locationState.pickupLocation.lat,
          pickupLng: locationState.pickupLocation.lng,
          destinationLat: locationState.destinationLocation.lat,
          destinationLng: locationState.destinationLocation.lng,
        },
      })
      .then(({ data }) => {
        if (data?.success && data?.data?.fares) {
          const fareData = data.data.fares;
          if (Object.keys(fareData).length > 0) {
            setFares(fareData);
            setSelected(RIDE_OPTIONS[0].id);
          } else {
            setError("No fares available for this route");
          }
        } else {
          setError(data?.message || "Could not load fares. Please go back and retry.");
        }
      })
      .catch((err) => {
        console.error("Fare API error:", err);
        setError(
          err.response?.data?.message ||
          "Failed to fetch fares. Check your network and try again."
        );
      });
  }, []); // empty deps — run once on mount only, use locationState captured above

  const handleBook = async () => {
    if (!selected || !fares) return;
    setBooking(true);
    try {
      const { data } = await api.post("/ride/create", {
        pickup:         locationState.pickupLocation.name,
        destination:    locationState.destinationLocation.name,
        pickupLat:      Number(locationState.pickupLocation.lat),
        pickupLng:      Number(locationState.pickupLocation.lng),
        destinationLat: Number(locationState.destinationLocation.lat),
        destinationLng: Number(locationState.destinationLocation.lng),
        vehicleType:    selected,
      });

      if (data?.success) {
        sessionStorage.removeItem("vsel_state"); // clean up after booking
        navigate("/user/searching-ride", {
          state: {
            rideId:         data.ride.id,
            pickup:         locationState.pickupLocation.name,
            destination:    locationState.destinationLocation.name,
            pickupLat:      locationState.pickupLocation.lat,
            pickupLng:      locationState.pickupLocation.lng,
            destinationLat: locationState.destinationLocation.lat,
            destinationLng: locationState.destinationLocation.lng,
            fare:           fares[selected],
            vehicleType:    selected,
            otp:            data.ride.otp,
          },
        });
      } else {
        alert(data?.message || "Booking failed. Please retry.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed. Please retry.");
    } finally {
      setBooking(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!error && !fares) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fafafa", gap: 16 }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e2e2", borderTopColor: "#0a0a0a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#6b6b6b" }}>Calculating fares...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="vsel vsel--err">
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p style={{ color: "#e53e3e", fontWeight: 600 }}>{error}</p>
        <button onClick={() => navigate("/home")}>← Go Back</button>
      </div>
    );
  }

  const selectedOption = RIDE_OPTIONS.find((o) => o.id === selected);

  return (
    <div className="vsel">
      {/* Header */}
      <div className="vsel__header">
        <button className="vsel__back" onClick={() => navigate("/home")}>←</button>
        <span className="vsel__title">Choose a ride</span>
        <div style={{ width: 38 }} />
      </div>

      {/* Route summary */}
      <div className="vsel__route">
        <div className="vsel__route-row">
          <span className="vsel__rdot vsel__rdot--g" />
          <span className="vsel__rname">{locationState?.pickupLocation?.name}</span>
        </div>
        <div className="vsel__rline" />
        <div className="vsel__route-row">
          <span className="vsel__rdot vsel__rdot--r" />
          <span className="vsel__rname">{locationState?.destinationLocation?.name}</span>
        </div>
      </div>

      {/* Vehicle list */}
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
              <div className="vsel__card-price">
                {price ? `₹${Math.round(price)}` : "—"}
              </div>
              {isSelected && <div className="vsel__check">✓</div>}
            </div>
          );
        })}
      </div>

      {/* Book button */}
      <div className="vsel__footer">
        <button
          className={`vsel__book ${selected ? "vsel__book--on" : ""}`}
          onClick={handleBook}
          disabled={!selected || booking}
        >
          {booking ? (
            <><span className="g-spinner" /> Booking...</>
          ) : selected ? (
            `Book ${selectedOption?.name} → ₹${Math.round(fares[selected])}`
          ) : (
            "Select a vehicle"
          )}
        </button>
      </div>
    </div>
  );
}
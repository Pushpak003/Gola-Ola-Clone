import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./VehicleSelection.css";

// Inline SVG icons — Ola-style flat vehicle illustrations
const VehicleIcons = {
  BIKE: () => (
    <svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="44">
      <circle cx="16" cy="36" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="64" cy="36" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="16" cy="36" r="3" fill="currentColor"/>
      <circle cx="64" cy="36" r="3" fill="currentColor"/>
      <path d="M16 26 L30 14 L46 14 L56 26 L36 26 Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M36 26 L40 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M56 26 L64 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M44 10 L52 10 L56 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M40 12 C40 12 42 8 46 8 L50 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  AUTO: () => (
    <svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="46">
      <circle cx="20" cy="40" r="9" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="60" cy="40" r="9" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="20" cy="40" r="3" fill="currentColor"/>
      <circle cx="60" cy="40" r="3" fill="currentColor"/>
      <path d="M8 40 L8 28 L16 14 L64 14 L72 28 L72 40 L8 40 Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M8 28 L72 28" stroke="currentColor" strokeWidth="2"/>
      <path d="M20 28 L20 14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
      <path d="M44 28 L44 14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
      <rect x="24" y="16" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <rect x="46" y="16" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M4 32 L8 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M72 32 L76 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  MINI: () => (
    <svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="46">
      <circle cx="22" cy="40" r="9" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="58" cy="40" r="9" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="22" cy="40" r="3" fill="currentColor"/>
      <circle cx="58" cy="40" r="3" fill="currentColor"/>
      <path d="M6 32 L6 40 L13 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M67 40 L74 40 L74 32 L66 18 L14 18 L6 32 L74 32" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M20 18 L18 32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
      <path d="M44 18 L44 32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
      <path d="M22 18 C22 18 24 10 40 10 C56 10 58 18 58 18" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <rect x="22" y="20" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <rect x="44" y="20" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M6 36 L2 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M74 36 L78 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  SEDAN: () => (
    <svg viewBox="0 0 88 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="46">
      <circle cx="24" cy="40" r="9" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="64" cy="40" r="9" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="24" cy="40" r="3" fill="currentColor"/>
      <circle cx="64" cy="40" r="3" fill="currentColor"/>
      <path d="M4 34 L4 40 L15 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M73 40 L84 40 L84 34 L76 20 L18 20 L8 34 L4 34" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M8 34 L84 34" stroke="currentColor" strokeWidth="2"/>
      <path d="M20 20 C20 20 24 12 44 12 C62 12 68 20 68 20" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <rect x="20" y="22" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <rect x="48" y="22" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M4 30 L1 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M84 30 L87 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M42 20 L42 12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
    </svg>
  ),
  SUV: () => (
    <svg viewBox="0 0 92 56" fill="none" xmlns="http://www.w3.org/2000/svg" width="84" height="50">
      <circle cx="24" cy="44" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="68" cy="44" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="24" cy="44" r="3.5" fill="currentColor"/>
      <circle cx="68" cy="44" r="3.5" fill="currentColor"/>
      <path d="M4 36 L4 44 L14 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M78 44 L88 44 L88 24 L80 12 L14 12 L6 24 L4 36 L88 36" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M14 12 L14 36" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4"/>
      <path d="M46 12 L46 36" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4"/>
      <rect x="16" y="14" width="26" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.65"/>
      <rect x="48" y="14" width="26" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.65"/>
      <path d="M4 30 L1 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M88 30 L91 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M80 12 L88 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
};

const RIDE_OPTIONS = [
  { id: "BIKE",  name: "Gola Moto",   tag: "Fastest",   seats: 1, eta: "2 min",  desc: "Beat city traffic" },
  { id: "AUTO",  name: "Gola Auto",   tag: "Budget",    seats: 3, eta: "3 min",  desc: "Affordable, open-air" },
  { id: "MINI",  name: "Gola Mini",   tag: "Popular",   seats: 4, eta: "4 min",  desc: "Compact everyday car" },
  { id: "SEDAN", name: "Gola Sedan",  tag: "Comfort",   seats: 4, eta: "5 min",  desc: "Spacious & smooth" },
  { id: "SUV",   name: "Gola SUV",    tag: "Premium",   seats: 6, eta: "6 min",  desc: "For those who travel big" },
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
          const Icon = VehicleIcons[opt.id];
          const price = fares[opt.id];
          const isSelected = selected === opt.id;
          return (
            <div
              key={opt.id}
              className={`vsel__card ${isSelected ? "vsel__card--on" : ""}`}
              onClick={() => setSelected(opt.id)}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="vsel__card-icon">
                <Icon />
              </div>
              <div className="vsel__card-info">
                <div className="vsel__card-top">
                  <span className="vsel__card-name">{opt.name}</span>
                  <span className={`vsel__card-tag vsel__card-tag--${opt.id.toLowerCase()}`}>{opt.tag}</span>
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
                ₹{price ? Math.round(price) : "—"}
              </div>
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
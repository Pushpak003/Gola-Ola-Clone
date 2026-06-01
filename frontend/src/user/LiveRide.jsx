import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket.js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Ride.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function LiveRide() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const captainMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);

  const [rideStatus, setRideStatus] = useState("ACCEPTED");
  const [captainCoords, setCaptainCoords] = useState(null);
  const [rating, setRating] = useState(0);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [state?.pickupLng || 77.4126, state?.pickupLat || 23.2599],
      zoom: 13,
    });

    // Pickup marker (green)
    if (state?.pickupLat && state?.pickupLng) {
      const el = document.createElement("div");
      el.className = "ride-marker ride-marker--pickup";
      el.innerHTML = "<span>A</span>";
      pickupMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([state.pickupLng, state.pickupLat])
        .addTo(map);
    }

    // Drop marker (red)
    if (state?.destinationLat && state?.destinationLng) {
      const el = document.createElement("div");
      el.className = "ride-marker ride-marker--drop";
      el.innerHTML = "<span>B</span>";
      dropMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([state.destinationLng, state.destinationLat])
        .addTo(map);
    }

    // Draw pickup→destination route
    map.on("load", () => {
      if (state?.pickupLng && state?.destinationLng) {
        fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${state.pickupLng},${state.pickupLat};${state.destinationLng},${state.destinationLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        )
          .then(r => r.json())
          .then(data => {
            const route = data.routes?.[0]?.geometry;
            if (!route) return;
            map.addSource("route", { type: "geojson", data: { type: "Feature", geometry: route } });
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              paint: { "line-color": "#0a0a0a", "line-width": 4, "line-opacity": 0.7 },
            });

            // Fit both markers
            const bounds = new mapboxgl.LngLatBounds()
              .extend([state.pickupLng, state.pickupLat])
              .extend([state.destinationLng, state.destinationLat]);
            map.fitBounds(bounds, { padding: 70 });
          });
      }
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Socket: captain location + ride events
  useEffect(() => {
    const onLocation = ({ lat, lng }) => {
      setCaptainCoords({ lat, lng });
      if (!mapRef.current) return;

      if (captainMarkerRef.current) {
        captainMarkerRef.current.setLngLat([lng, lat]);
      } else {
        const el = document.createElement("div");
        el.className = "captain-marker";
        el.innerHTML = state?.vehicleType === "BIKE" ? "🏍️" : state?.vehicleType === "AUTO" ? "🛺" : "🚗";
        captainMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      }
    };

    const onCompleted = () => setRideStatus("COMPLETED");

    socket.on("captain-location-update", onLocation);
    socket.on("ride-completed", onCompleted);
    return () => {
      socket.off("captain-location-update", onLocation);
      socket.off("ride-completed", onCompleted);
    };
  }, [state?.vehicleType]);

  // Ride completed screen
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
            {[1,2,3,4,5].map(s => (
              <span
                key={s}
                className={`liveride__star ${s <= rating ? "liveride__star--on" : ""}`}
                onClick={() => setRating(s)}
              >★</span>
            ))}
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
      {/* Map takes full screen */}
      <div ref={mapContainerRef} className="liveride__map" />

      {/* Top overlay */}
      <div className="liveride__topbar">
        <span className="liveride__logo">GOLA</span>
        <span className="liveride__tag">
          {rideStatus === "ACCEPTED" ? "⏳ Captain En Route" : "🚀 Ride In Progress"}
        </span>
      </div>

      {/* Bottom info sheet */}
      <div className="liveride__sheet">
        <div className="liveride__sheet-handle" />

        {/* Captain row */}
        <div className="liveride__captain-row">
          <div className="liveride__captain-ava">{vehicleEmoji}</div>
          <div className="liveride__captain-info">
            <div className="liveride__captain-name">Your Captain</div>
            <div className="liveride__captain-loc">
              {captainCoords
                ? `📍 Updating location...`
                : "Heading towards you..."}
            </div>
          </div>
          <div className="liveride__fare">₹{state?.fare ? Math.round(state.fare) : "—"}</div>
        </div>

        {/* OTP — show only before ride starts */}
        {rideStatus === "ACCEPTED" && (
          <div className="liveride__otp-box">
            <span className="liveride__otp-label">Your OTP</span>
            <span className="liveride__otp">{state?.otp}</span>
            <span className="liveride__otp-hint">Show to captain at pickup</span>
          </div>
        )}

        {/* Route */}
        <div className="liveride__route-row">
          <div className="liveride__rpoint">
            <span className="liveride__rdot liveride__rdot--g" />
            <span className="liveride__rtext">{state?.pickup}</span>
          </div>
          <div className="liveride__rconnect" />
          <div className="liveride__rpoint">
            <span className="liveride__rdot liveride__rdot--r" />
            <span className="liveride__rtext">{state?.destination}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
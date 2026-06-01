import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket.js";
import api from "../api/axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../user/Ride.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function CaptainLiveRide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ride = state?.ride;

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const selfMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);

  const [rideStatus, setRideStatus] = useState(ride?.status || "ACCEPTED");
  const [otpInput, setOtpInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Send captain location periodically
  useEffect(() => {
    if (rideStatus !== "ACCEPTED" && rideStatus !== "STARTED") return;

    const interval = setInterval(() => {
      if (!socket.connected) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          socket.emit("captain-location", { rideId: ride?.id, lat, lng });

          if (mapRef.current && selfMarkerRef.current) {
            selfMarkerRef.current.setLngLat([lng, lat]);
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [rideStatus, ride?.id]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || !ride) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [ride.pickupLng || 77.4126, ride.pickupLat || 23.2599],
      zoom: 13,
    });

    // Pickup marker
    if (ride.pickupLat && ride.pickupLng) {
      const el = document.createElement("div");
      el.className = "ride-marker ride-marker--pickup";
      el.innerHTML = "<span>A</span>";
      pickupMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([ride.pickupLng, ride.pickupLat])
        .addTo(map);
    }

    // Drop marker
    if (ride.destinationLat && ride.destinationLng) {
      const el = document.createElement("div");
      el.className = "ride-marker ride-marker--drop";
      el.innerHTML = "<span>B</span>";
      dropMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([ride.destinationLng, ride.destinationLat])
        .addTo(map);
    }

    // Self marker (captain)
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const el = document.createElement("div");
      el.className = "captain-self-marker";
      el.innerHTML = "📍";
      selfMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    // Draw route
    map.on("load", () => {
      if (ride.pickupLng && ride.destinationLng) {
        fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${ride.pickupLng},${ride.pickupLat};${ride.destinationLng},${ride.destinationLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        )
          .then((r) => r.json())
          .then((data) => {
            const route = data.routes?.[0]?.geometry;
            if (!route) return;
            map.addSource("route", {
              type: "geojson",
              data: { type: "Feature", geometry: route },
            });
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              paint: {
                "line-color": "#0a0a0a",
                "line-width": 4,
                "line-opacity": 0.7,
              },
            });

            const bounds = new mapboxgl.LngLatBounds()
              .extend([ride.pickupLng, ride.pickupLat])
              .extend([ride.destinationLng, ride.destinationLat]);
            map.fitBounds(bounds, { padding: 70 });
          });
      }
    });

    mapRef.current = map;
    return () => map.remove();
  }, [ride]);

  // Socket: ride events
  useEffect(() => {
    const onCompleted = () => setRideStatus("COMPLETED");
    socket.on("ride-completed", onCompleted);
    return () => socket.off("ride-completed", onCompleted);
  }, []);

  const startRide = async () => {
    if (!otpInput) return setError("Enter the OTP");
    setActionLoading(true);
    setError("");
    try {
      await api.post("/ride/start", { rideId: ride.id, otp: otpInput });
      setRideStatus("STARTED");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start ride");
    } finally {
      setActionLoading(false);
    }
  };

  const completeRide = async () => {
    setActionLoading(true);
    setError("");
    try {
      await api.post("/ride/complete", { rideId: ride.id });
      navigate("/captain/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete ride");
    } finally {
      setActionLoading(false);
    }
  };

  if (!ride) {
    return (
      <div className="clive">
        <div className="clive__header">
          <span className="clive__logo">GOLA</span>
        </div>
        <div className="clive__body" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>No ride data available.</p>
        </div>
      </div>
    );
  }

  const vehicleEmoji =
    ride.vehicleType === "BIKE" ? "🏍️" : ride.vehicleType === "AUTO" ? "🛺" : "🚗";

  return (
    <div className="clive">
      <div ref={mapContainerRef} className="clive__map" />

      <div className="clive__topbar">
        <span className="clive__logo">GOLA</span>
        <span className="clive__tag">
          {rideStatus === "ACCEPTED"
            ? "⏳ Heading to pickup"
            : rideStatus === "STARTED"
              ? "🚀 On ride"
              : "✅ Completed"}
        </span>
      </div>

      <div className="clive__sheet">
        <div className="clive__sheet-handle" />

        <div className="clive__route-mini">
          <div className="clive__rrow">
            <span className="clive__rdot clive__rdot--g" />
            <span className="clive__rname">{ride.pickup}</span>
          </div>
          <div className="clive__rline" />
          <div className="clive__rrow">
            <span className="clive__rdot clive__rdot--r" />
            <span className="clive__rname">{ride.destination}</span>
          </div>
        </div>

        <div className="clive__meta-row">
          <div className="clive__meta-item">
            <span className="clive__meta-val">{vehicleEmoji}</span>
            <span className="clive__meta-key">{ride.vehicleType}</span>
          </div>
          <div className="clive__meta-item">
            <span className="clive__meta-val">₹{Math.round(ride.fare)}</span>
            <span className="clive__meta-key">Fare</span>
          </div>
          <div className="clive__meta-item">
            <span className="clive__meta-val">{ride.otp}</span>
            <span className="clive__meta-key">OTP</span>
          </div>
        </div>

        {error && <div className="clive__error">{error}</div>}

        {rideStatus === "ACCEPTED" && (
          <div className="clive__otp-section">
            <span className="clive__otp-hint">
              Ask the user for this OTP to start the ride
            </span>
            <input
              className="clive__otp-input"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
            />
            <button
              className="clive__start-btn"
              onClick={startRide}
              disabled={actionLoading}
            >
              {actionLoading ? "..." : "✓ Start Ride"}
            </button>
          </div>
        )}

        {rideStatus === "STARTED" && (
          <button
            className="clive__complete-btn"
            onClick={completeRide}
            disabled={actionLoading}
          >
            {actionLoading ? "..." : "✓ Complete Ride"}
          </button>
        )}
      </div>
    </div>
  );
}

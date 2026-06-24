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

  // Re-register user socket on every page mount — critical so backend can
  // deliver ride-started / ride-completed even after React Router navigation
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!socket.connected) socket.connect();
    socket.emit("user-online", { token });
  }, []);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [state?.pickupLng || 77.4126, state?.pickupLat || 23.2599],
      zoom: 13,
    });

    if (state?.pickupLat && state?.pickupLng) {
      const el = document.createElement("div");
      el.className = "ride-marker ride-marker--pickup";
      el.innerHTML = "<span>A</span>";
      pickupMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([state.pickupLng, state.pickupLat])
        .addTo(map);
    }

    if (state?.destinationLat && state?.destinationLng) {
      const el = document.createElement("div");
      el.className = "ride-marker ride-marker--drop";
      el.innerHTML = "<span>B</span>";
      dropMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([state.destinationLng, state.destinationLat])
        .addTo(map);
    }

    map.on("load", () => {
      if (state?.pickupLng && state?.destinationLng) {
        fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${state.pickupLng},${state.pickupLat};${state.destinationLng},${state.destinationLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        )
          .then((r) => r.json())
          .then((data) => {
            const route = data.routes?.[0]?.geometry;
            if (!route) return;
            map.addSource("route", { type: "geojson", data: { type: "Feature", geometry: route } });
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              paint: { "line-color": "#0a0a0a", "line-width": 4, "line-opacity": 0.7 },
            });
            const bounds = new mapboxgl.LngLatBounds()
              .extend([state.pickupLng, state.pickupLat])
              .extend([state.destinationLng, state.destinationLat]);
            map.fitBounds(bounds, { padding: 70 });
          });
      }
    });

    mapRef.current = map;
    return () => map.remove();
  }, [state]);

  // Socket events
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

    const onStarted = () => setRideStatus("STARTED");

    const onCompleted = (ride) => {
      // Prioritise state values (passed from vehicleSelection/searching)
      // Backend ride-completed only has id, status — not fare/pickup in all cases
      navigate("/user/payment", {
        state: {
          ride: {
            ...ride,
            id: state?.rideId || ride?.id,
            pickup: state?.pickup || ride?.pickup,
            destination: state?.destination || ride?.destination,
            fare: state?.fare || ride?.fare,
            vehicleType: state?.vehicleType || ride?.vehicleType,
          },
        },
      });
    };

    socket.on("captain-location-update", onLocation);
    socket.on("ride-started", onStarted);
    socket.on("ride-completed", onCompleted);
    return () => {
      socket.off("captain-location-update", onLocation);
      socket.off("ride-started", onStarted);
      socket.off("ride-completed", onCompleted);
    };
  }, [state, navigate]);

  const vehicleEmoji = state?.vehicleType === "BIKE" ? "🏍️" : state?.vehicleType === "AUTO" ? "🛺" : "🚗";

  return (
    <div className="liveride">
      <div ref={mapContainerRef} className="liveride__map" />

      <div className="liveride__topbar">
        <span className="liveride__logo">GOLA</span>
        <span className="liveride__tag">
          {rideStatus === "ACCEPTED" ? "⏳ Captain En Route" : "🚀 Ride In Progress"}
        </span>
      </div>

      <div className="liveride__sheet">
        <div className="liveride__sheet-handle" />

        <div className="liveride__captain-row">
          <div className="liveride__captain-ava">{vehicleEmoji}</div>
          <div className="liveride__captain-info">
            <div className="liveride__captain-name">Your Captain</div>
            <div className="liveride__captain-loc">
              {captainCoords ? "📍 Updating location..." : "Heading towards you..."}
            </div>
          </div>
          <div className="liveride__fare">₹{state?.fare ? Math.round(state.fare) : "—"}</div>
        </div>

        {rideStatus === "ACCEPTED" && (
          <div className="liveride__otp-box">
            <span className="liveride__otp-label">Your OTP</span>
            <span className="liveride__otp">{state?.otp}</span>
            <span className="liveride__otp-hint">Show to captain at pickup</span>
          </div>
        )}

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
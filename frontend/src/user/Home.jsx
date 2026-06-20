import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI as api } from "../api/axios";
import { socket } from "../sockets/socket.js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Home.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Home() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupResults, setPickupResults] = useState([]);
  const [destinationResults, setDestinationResults] = useState([]);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [activeInput, setActiveInput] = useState(null); // "pickup" | "destination"
  const [locLoading, setLocLoading] = useState(false);

  // Socket connect on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socket.connect();
      socket.emit("user-online", { token });
    }
  }, []);

  // Init map
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.4126, 23.2599], // default: Bhopal center
      zoom: 12,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Get user location on mount → pin on map
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocLoading(false);

        // Fly map to user
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 14 });
        }

        // Add/update user location marker (blue pulsing dot)
        if (userMarkerRef.current) userMarkerRef.current.remove();
        const el = document.createElement("div");
        el.className = "user-location-dot";
        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([coords.lng, coords.lat])
          .addTo(mapRef.current);
      },
      () => {
        setLocLoading(false);
        alert("Please allow location access for nearby suggestions.");
      },
      { enableHighAccuracy: true }
    );
  };

  const setMyLocationAsPickup = () => {
    if (!userCoords) return getUserLocation();
    // Reverse geocode via Mapbox to get place name
    setLocLoading(true);
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${userCoords.lng},${userCoords.lat}.json?access_token=${mapboxgl.accessToken}&country=in&limit=1`
    )
      .then((r) => r.json())
      .then((data) => {
        const placeName = data.features?.[0]?.place_name || "My Location";
        setPickup(placeName);
        setPickupLocation({ name: placeName, lat: userCoords.lat, lng: userCoords.lng });
        setPickupResults([]);
        setActiveInput(null);
        setLocLoading(false);

        // Add pickup marker
        if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
        pickupMarkerRef.current = new mapboxgl.Marker({ color: "#1db954" })
          .setLngLat([userCoords.lng, userCoords.lat])
          .addTo(mapRef.current);
      })
      .catch(() => {
        // Fallback if reverse geocode fails
        setPickup("My Location");
        setPickupLocation({ name: "My Location", lat: userCoords.lat, lng: userCoords.lng });
        setLocLoading(false);
      });
  };

  const searchPlaces = async (value, type) => {
    if (type === "pickup") setPickup(value);
    else setDestination(value);

    if (value.length < 3) {
      type === "pickup" ? setPickupResults([]) : setDestinationResults([]);
      return;
    }

    try {
      const { data } = await api.get("/map/search", {
        params: {
          query: value,
          userLat: userCoords?.lat,
          userLng: userCoords?.lng,
        },
      });

      // Backend returns Mapbox features: { place_name, center: [lng, lat] }
      const results = (data.places || []).map((f) => ({
        id: f.id,
        place_name: f.place_name,
        lat: f.center[1],
        lng: f.center[0],
      }));

      type === "pickup" ? setPickupResults(results) : setDestinationResults(results);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const selectPlace = (place, type) => {
    const coords = { name: place.place_name, lat: place.lat, lng: place.lng };

    if (type === "pickup") {
      setPickup(place.place_name);
      setPickupLocation(coords);
      setPickupResults([]);
      setActiveInput(null);

      if (mapRef.current) {
        if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
        pickupMarkerRef.current = new mapboxgl.Marker({ color: "#1db954" })
          .setLngLat([coords.lng, coords.lat])
          .addTo(mapRef.current);
        mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 14 });
      }
    } else {
      setDestination(place.place_name);
      setDestinationLocation(coords);
      setDestinationResults([]);
      setActiveInput(null);

      if (mapRef.current) {
        if (destMarkerRef.current) destMarkerRef.current.remove();
        destMarkerRef.current = new mapboxgl.Marker({ color: "#e53e3e" })
          .setLngLat([coords.lng, coords.lat])
          .addTo(mapRef.current);

        if (pickupLocation) {
          const bounds = new mapboxgl.LngLatBounds()
            .extend([pickupLocation.lng, pickupLocation.lat])
            .extend([coords.lng, coords.lat]);
          mapRef.current.fitBounds(bounds, { padding: 80 });
        } else {
          mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 14 });
        }
      }
    }
  };

  const handleContinue = () => {
    if (!pickupLocation || !destinationLocation) return;
    navigate("/vehicle-selection", { state: { pickupLocation, destinationLocation } });
  };

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const canContinue = pickupLocation && destinationLocation;

  return (
    <div className="home">
      {/* Map */}
      <div ref={mapContainerRef} className="home__map" />

      {/* Top bar */}
      <div className="home__topbar">
        <span className="home__logo">GOLA</span>
        <div className="home__topbar-right"><button className="home__history-btn" onClick={() => navigate("/user/history")}>History</button><button className="home__logout" onClick={handleLogout}>Sign out</button></div>
      </div>

      {/* Bottom sheet */}
      <div className="home__sheet">
        <div className="home__sheet-handle" />
        <h3 className="home__sheet-title">Where to? 🚕</h3>

        {/* Pickup field */}
        <div className="home__field-group">
          <div className={`home__input-row ${activeInput === "pickup" ? "home__input-row--active" : ""}`}>
            <div className="home__dot home__dot--green" />
            <input
              type="text"
              placeholder="Pickup location"
              value={pickup}
              onFocus={() => setActiveInput("pickup")}
              onChange={(e) => searchPlaces(e.target.value, "pickup")}
              className="home__input"
            />
            {/* My Location button */}
            <button
              className="home__myloc-btn"
              onClick={setMyLocationAsPickup}
              disabled={locLoading}
              title="Use my current location"
            >
              {locLoading ? (
                <span className="home__myloc-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                </svg>
              )}
            </button>
          </div>

          {/* Pickup suggestions */}
          {pickupResults.length > 0 && activeInput === "pickup" && (
            <div className="home__dropdown">
              {pickupResults.map((place) => (
                <div
                  key={place.id}
                  className="home__dropdown-item"
                  onClick={() => selectPlace(place, "pickup")}
                >
                  <span className="home__dropdown-icon">📍</span>
                  <span className="home__dropdown-text">{place.place_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="home__divider" />

        {/* Destination field */}
        <div className="home__field-group">
          <div className={`home__input-row ${activeInput === "destination" ? "home__input-row--active" : ""}`}>
            <div className="home__dot home__dot--red" />
            <input
              type="text"
              placeholder="Where are you going?"
              value={destination}
              onFocus={() => setActiveInput("destination")}
              onChange={(e) => searchPlaces(e.target.value, "destination")}
              className="home__input"
            />
          </div>

          {/* Destination suggestions */}
          {destinationResults.length > 0 && activeInput === "destination" && (
            <div className="home__dropdown">
              {destinationResults.map((place) => (
                <div
                  key={place.id}
                  className="home__dropdown-item"
                  onClick={() => selectPlace(place, "destination")}
                >
                  <span className="home__dropdown-icon">🏁</span>
                  <span className="home__dropdown-text">{place.place_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className={`home__cta ${canContinue ? "home__cta--active" : ""}`}
          onClick={handleContinue}
          disabled={!canContinue}
        >
          {canContinue ? "Find Rides →" : "Select pickup & destination"}
        </button>
      </div>
    </div>
  );
}
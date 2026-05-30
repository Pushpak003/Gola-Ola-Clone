import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../sockets/socket.js"; // 🌟 Socket import kiya
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Token from env or direct injection
mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

export default function Home() {
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLng, setCurrentLng] = useState(null);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [pickupResults, setPickupResults] = useState([]);
  const [destinationResults, setDestinationResults] = useState([]);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  // 🌟 Real-time Handshake Engine: Page reload hone par bhi user ko online rakhega
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "user") {
      console.log("INITIALIZING USER SOCKET HANDSHAKE FROM HOME...");
      socket.connect(); // Core socket layer trigger

      // Backend ko user status notify karo
      socket.emit("user-online", { token });
      console.log("🚀 EMITTED 'user-online' WITH TOKEN =>", token);
    }
  }, []);

  // Initialize Mapbox Canvas
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.4126, 23.2599], // Default Central India / Bhopal
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => map.remove();
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLat(position.coords.latitude);
        setCurrentLng(position.coords.longitude);

        console.log(
          "CURRENT LOCATION =>",
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        console.log(error);
      },
    );
  }, []);

  const searchPickup = async (value) => {
    setPickup(value);
    if (value.length < 3) {
      setPickupResults([]);
      return;
    }
    if (!currentLat || !currentLng) {
      console.log("Waiting for location...");
      return;
    }
    try {
      const response = await api.get("/map/search", {
        params: { query: value, userLat: currentLat, userLng: currentLng },
      });
      setPickupResults(response.data.places || []);
    } catch (error) {
      console.log("FULL ERROR =>", error);
      console.log("BACKEND =>", error.response?.data);
    }
  };

  const searchDestination = async (value) => {
    setDestination(value);
    if (value.length < 3) {
      setDestinationResults([]);
      return;
    }
    if (!currentLat || !currentLng) {
      console.log("Waiting for location...");
      return;
    }
    try {
      const response = await api.get("/map/search", {
        params: { query: value, userLat: currentLat, userLng: currentLng },
      });
      setDestinationResults(response.data.places || []);
    } catch (error) {
      console.log("FULL ERROR =>", error);
      console.log("BACKEND =>", error.response?.data);
    }
  };

  const handleContinue = () => {
    if (!pickupLocation || !destinationLocation) {
      return alert("Please select pickup and destination");
    }
    navigate("/vehicle-selection", {
      state: {
        pickupLocation,
        destinationLocation,
      },
    });
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-100 font-sans">
      {/* 1. Map Container - Bottom Canvas Layer */}
      <div
        ref={mapContainerRef}
        className="h-[60%] w-full absolute top-0 left-0 z-0"
      />

      {/* Floating Header Branding */}
      <div className="absolute top-4 left-4 bg-black text-white px-5 py-2 rounded-full font-black tracking-wider shadow-lg z-10 text-sm">
        GOLA
      </div>

      {/* 2. Interactive Booking Sliding Card */}
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-2xl z-10 px-6 py-5 max-h-[45%] overflow-y-auto border-t border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          Kahan chalna hai? 🚕
        </h3>

        <div className="space-y-3 relative">
          {/* Pickup Selection Input block */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Enter Pickup Location"
              value={pickup}
              onChange={(e) => searchPickup(e.target.value)}
              className="w-full bg-gray-100 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black border border-transparent transition"
            />
            {pickupResults.length > 0 && (
              <div className="absolute left-0 right-0 bg-white shadow-xl rounded-xl max-h-48 overflow-y-auto z-50 border mt-1 border-gray-100">
                {pickupResults.map((place) => (
                  <div
                    key={place.id || place.place_name}
                    onClick={() => {
                      console.log("CLICKED PICKUP PLACE =>", place);
                      setPickup(place.place_name);

                      const lat =
                        place.place?.lat ||
                        place.lat ||
                        (place.geometry?.coordinates
                          ? place.geometry.coordinates[1]
                          : 23.2599);
                      const lng =
                        place.place?.lng ||
                        place.lng ||
                        (place.geometry?.coordinates
                          ? place.geometry.coordinates[0]
                          : 77.4126);

                      const coords = {
                        name: place.place_name,
                        lat: Number(lat),
                        lng: Number(lng),
                      };

                      setPickupLocation(coords);
                      setPickupResults([]);

                      if (mapRef.current) {
                        if (pickupMarkerRef.current)
                          pickupMarkerRef.current.remove();
                        const marker = new mapboxgl.Marker({ color: "#22c55e" })
                          .setLngLat([coords.lng, coords.lat])
                          .addTo(mapRef.current);
                        pickupMarkerRef.current = marker;

                        mapRef.current.flyTo({
                          center: [coords.lng, coords.lat],
                          zoom: 14,
                        });
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      padding: "8px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    📍 {place.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Selection Input block */}
          <div className="relative">
            <input
              type="text"
              placeholder="🏁 Enter Destination"
              value={destination}
              onChange={(e) => searchDestination(e.target.value)}
              className="w-full bg-gray-100 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black border border-transparent transition"
            />
            {destinationResults.length > 0 && (
              <div className="absolute left-0 right-0 bg-white shadow-xl rounded-xl max-h-48 overflow-y-auto z-50 border mt-1 border-gray-100">
                {destinationResults.map((place) => (
                  <div
                    key={place.id || place.place_name}
                    onClick={() => {
                      console.log("CLICKED DESTINATION PLACE =>", place);
                      setDestination(place.place_name);

                      const lat =
                        place.place?.lat ||
                        place.lat ||
                        (place.geometry?.coordinates
                          ? place.geometry.coordinates[1]
                          : 23.2599);
                      const lng =
                        place.place?.lng ||
                        place.lng ||
                        (place.geometry?.coordinates
                          ? place.geometry.coordinates[0]
                          : 77.4126);

                      const coords = {
                        name: place.place_name,
                        lat: Number(lat),
                        lng: Number(lng),
                      };

                      setDestinationLocation(coords);
                      setDestinationResults([]);

                      if (mapRef.current) {
                        if (destMarkerRef.current)
                          destMarkerRef.current.remove();
                        const marker = new mapboxgl.Marker({ color: "#ef4444" })
                          .setLngLat([coords.lng, coords.lat])
                          .addTo(mapRef.current);
                        destMarkerRef.current = marker;

                        if (pickupLocation) {
                          const bounds = new mapboxgl.LngLatBounds()
                            .extend([pickupLocation.lng, pickupLocation.lat])
                            .extend([coords.lng, coords.lat]);
                          mapRef.current.fitBounds(bounds, { padding: 50 });
                        }
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      padding: "8px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    🏳️‍🌈 {place.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition mt-2 active:scale-98 shadow-md"
          >
            Find Available Options →
          </button>
        </div>
      </div>
    </div>
  );
}

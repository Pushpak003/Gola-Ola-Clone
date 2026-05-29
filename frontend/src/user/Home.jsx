import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Home() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [pickupResults, setPickupResults] = useState([]);
  const [destinationResults, setDestinationResults] = useState([]);

  const [pickupLocation, setPickupLocation] = useState(null);

  const [destinationLocation, setDestinationLocation] = useState(null);

  const searchPickup = async (value) => {
    setPickup(value);

    if (value.length < 3) {
      setPickupResults([]);
      return;
    }

    try {
      const response = await api.get(`/map/search?query=${value}`);

      setPickupResults(response.data.places || []);
    } catch (error) {
      console.log(error);
    }
  };

  const searchDestination = async (value) => {
    setDestination(value);

    if (value.length < 3) {
      setDestinationResults([]);
      return;
    }

    try {
      const response = await api.get(`/map/search?query=${value}`);

      setDestinationResults(response.data.places || []);
    } catch (error) {
      console.log(error);
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
    <div
      style={{
        padding: "20px",
      }}
    >
      <h1>Book Ride</h1>

      <br />

      <input
        type="text"
        placeholder="Pickup Location"
        value={pickup}
        onChange={(e) => searchPickup(e.target.value)}
      />

      {pickupResults.map((place) => (
        <div
          key={place.id || place.place_name}
          onClick={() => {
            console.log(place);
            setPickup(place.place_name);

            setPickupLocation({
              name: place.place_name,
              lat: place.place.lat,
              lng: place.place.lng,
            });

            setPickupResults([]);
          }}
          style={{
            cursor: "pointer",
            padding: "5px",
          }}
        >
          {place.place_name}
        </div>
      ))}

      <br />

      <input
        type="text"
        placeholder="Destination"
        value={destination}
        onChange={(e) => searchDestination(e.target.value)}
      />

      {destinationResults.map((place) => (
        <div
          key={place.id || place.place_name}
          onClick={() => {
            console.log(place);
            setDestination(place.place_name);

            setDestinationLocation({
              name: place.place_name,
              lat: place.place.lat,
              lng: place.place.lng,
            });

            setDestinationResults([]);
          }}
          style={{
            cursor: "pointer",
            padding: "5px",
          }}
        >
          {place.place_name}
        </div>
      ))}

      <br />
      <br />

      <button onClick={handleContinue}>Continue</button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

export default function VehicleSelection() {
 
  const { state } = useLocation();
  
  const [fares, setFares] = useState(null);
  useEffect(() => {
    console.log("FULL STATE =>", state);

    const getFare = async () => {
      try {
        console.log("PICKUP =>", state?.pickupLocation);

        console.log("DESTINATION =>", state?.destinationLocation);

        const params = {
          pickupLat: state?.pickupLocation?.lat,

          pickupLng: state?.pickupLocation?.lng,

          destinationLat: state?.destinationLocation?.lat,

          destinationLng: state?.destinationLocation?.lng,
        };

        console.log("PARAMS =>", params);

        const response = await api.get("/ride/fare", {
          params,
        });

        console.log("FARE RESPONSE =>", response.data);

        setFares(response.data.data);
      } catch (error) {
        console.log("ERROR =>", error.response?.data);

        console.log(error);
      }
    };

    getFare();
  }, []);

  if (!fares) {
    return <h1>Loading fares...</h1>;
  }

  return (
    <div>
      <h1>Select Vehicle</h1>

      <pre>{JSON.stringify(fares, null, 2)}</pre>
    </div>
  );
}

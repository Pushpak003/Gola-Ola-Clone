import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../sockets/socket.js";

export default function VehicleSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [fares, setFares] = useState(null);
  // 🌟 CHANGE: Default selection keys ko exact Postman logic uppercase database Enums par rakha
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const getFare = async () => {
      try {
        const params = {
          pickupLat: state?.pickupLocation?.lat,
          pickupLng: state?.pickupLocation?.lng,
          destinationLat: state?.destinationLocation?.lat,
          destinationLng: state?.destinationLocation?.lng,
        };

        const response = await api.get("/ride/fare", { params });
        console.log("RAW FARE FROM BACKEND =>", response.data);

        if (response.data?.success && response.data?.data?.fares) {
          setFares(response.data.data.fares);
        } else if (response.data?.data) {
          setFares(response.data.data);
        }
      } catch (error) {
        console.log("ERROR FETCHING FARES =>", error);
      }
    };

    if (state?.pickupLocation) {
      getFare();
    }
  }, [state]);

  console.log("USER TOKEN =>", localStorage.getItem("userToken"));
  console.log("CAPTAIN TOKEN =>", localStorage.getItem("captainToken"));
  console.log("TOKEN =>", localStorage.getItem("token"));
  const handleBookRide = async () => {
    console.log("TOKEN =>", localStorage.getItem("token"));
    if (!selectedVehicle) {
      return alert("Pehle ek gadi select karo bhai! 🚗/🛺/🏍️");
    }

    setBookingLoading(true);
    try {
      // 🌟 EXACT POSTMAN PAYLOAD MATCH
      const payload = {
        pickup: state?.pickupLocation?.name,
        destination: state?.destinationLocation?.name,
        pickupLat: Number(state?.pickupLocation?.lat),
        pickupLng: Number(state?.pickupLocation?.lng),
        destinationLat: Number(state?.destinationLocation?.lat),
        destinationLng: Number(state?.destinationLocation?.lng),
        vehicleType: selectedVehicle, // Isme direct "BIKE", "AUTO", ya "MINI" jayega
      };

      console.log("SENDING POSTMAN IDENTICAL PAYLOAD =>", payload);
      const response = await api.post("/ride/create", payload);

      if (response.data?.success) {
        const rideData = response.data.ride;

        navigate("/user/searching-ride", {
          state: {
            rideId: rideData.id,
            pickup: state?.pickupLocation?.name,
            destination: state?.destinationLocation?.name,
            // 🌟 SAFE EXTRACT: Keys matching uppercase map pattern
            fare:
              fares[selectedVehicle] || fares[selectedVehicle.toLowerCase()],
            vehicleType: selectedVehicle,
          },
        });
      }
    } catch (error) {
      console.log(
        "BOOKING FAILURE FROM BACKEND =>",
        error.response?.data || error,
      );
      alert(error.response?.data?.message || "Booking request failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!fares) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-2">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-medium">
          Calculating dynamic fares...
        </p>
      </div>
    );
  }

  // 🌟 MAP CONFIG USING STRICT UPPERCASE ENUMS AS IDS
  const rideCategories = [
    {
      id: "MINI",
      title: "Gola Cab Premium",
      price: fares.car || fares.MINI,
      icon: "🚗",
      eta: "3 mins away",
      capacity: 4,
    },
    {
      id: "AUTO",
      title: "Gola Auto Eco",
      price: fares.auto || fares.AUTO,
      icon: "🛺",
      eta: "1 min away",
      capacity: 3,
    },
    {
      id: "BIKE",
      title: "Gola Bike Moto",
      price: fares.bike || fares.BIKE,
      icon: "🏍️",
      eta: "2 mins away",
      capacity: 1,
    },
  ];

  return (
    <div className="h-screen w-screen bg-gray-50 p-5 flex flex-col justify-between font-sans">
      <div>
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate("/home")}
            className="text-sm font-semibold text-gray-500 hover:text-black"
          >
            ← Change Route
          </button>
          <h2 className="text-base font-bold text-gray-900">Select Options</h2>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm mb-4 border text-xs text-gray-500 space-y-1">
          <p className="truncate">
            <span className="text-green-500 font-bold">From:</span>{" "}
            {state?.pickupLocation?.name}
          </p>
          <p className="truncate">
            <span className="text-red-500 font-bold">To:</span>{" "}
            {state?.destinationLocation?.name}
          </p>
        </div>

        <div className="space-y-3">
          {rideCategories.map((ride) => (
            <div
              key={ride.id}
              onClick={() => {
                console.log("SELECTED VEHICLE KEY =>", ride.id);
                setSelectedVehicle(ride.id);
              }}
              className={`flex items-center justify-between p-4 bg-white border-2 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 active:scale-98 ${
                selectedVehicle === ride.id
                  ? "border-black bg-gray-50 ring-1 ring-black"
                  : "border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl bg-gray-100 p-2 rounded-xl">
                  {ride.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {ride.title}
                    </h4>
                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                      👤 {ride.capacity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{ride.eta}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-gray-900 text-base">
                  ₹{ride.price || "0"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleBookRide}
        disabled={bookingLoading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-950 transition text-sm shadow-lg disabled:bg-gray-400 mb-2"
      >
        {bookingLoading ? "Requesting Gola..." : "Confirm Ride Booking"}
      </button>
    </div>
  );
}

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket.js";

export default function SearchingRide() {
  console.log("SEARCHING PAGE TOKEN =>", localStorage.getItem("userToken"));
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 🎧 Listen for Captain's Acceptance Event via WebSockets
    socket.on("ride-confirmed", (data) => {
      console.log("JACKPOT! CAPTAIN ACCEPTED THE RIDE =>", data);
      
      // Seedhe dynamic live tracking monitor panel par bhejo
      navigate("/user/live-ride", {
        state: {
          rideId: state?.rideId,
          captainDetails: data.captain, // Name, vehicle number, phone number
          pickup: state?.pickup,
          destination: state?.destination,
          fare: state?.fare
        }
      });
    });

    return () => {
      socket.off("ride-confirmed");
    };
  }, [state, navigate]);

  const handleCancelRide = () => {
    // Implement standard backend cancellation hook if route is setup
    socket.emit("cancel-ride-search", { rideId: state?.rideId });
    alert("Ride request cancelled successfully.");
    navigate("/home");
  };

  return (
    <div className="h-screen w-screen bg-white p-6 flex flex-col justify-between items-center font-sans text-center">
      <div className="w-full pt-12 flex flex-col items-center">
        {/* Animated Custom Pulse Waves */}
        <div className="relative w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-black rounded-full opacity-10 animate-ping"></div>
          <span className="text-5xl">🚕</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Finding Your Gola Captain</h2>
        <p className="text-sm text-gray-400 px-6">
          Sending request to the closest drivers near <span className="text-black font-semibold">"{state?.pickup}"</span>
        </p>
      </div>

      {/* Ride Brief Sticky Card */}
      <div className="w-full max-w-md bg-gray-50 border border-gray-100 p-4 rounded-2xl text-left space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Category: {state?.vehicleType}</span>
          <span className="text-base font-black text-gray-900">₹{state?.fare}</span>
        </div>
        <div className="text-xs space-y-2 text-gray-600">
          <p className="truncate">🟢 <span className="font-semibold text-gray-800">Pickup:</span> {state?.pickup}</p>
          <p className="truncate">🔴 <span className="font-semibold text-gray-800">Drop:</span> {state?.destination}</p>
        </div>
      </div>

      <button 
        onClick={handleCancelRide}
        className="w-full max-w-md bg-red-50 text-red-600 py-3.5 rounded-xl font-bold hover:bg-red-100 transition text-sm border border-red-200 mb-4"
      >
        Cancel Request
      </button>
    </div>
  );
}
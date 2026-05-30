import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket";

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(false);

  const navigate = useNavigate();

  const goOnline = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        socket.connect();

        socket.emit("captain-online", {
          token: localStorage.getItem("captainToken"),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        socket.on("new-ride", (ride) => {
          console.log("NEW RIDE RECEIVED =>", ride);
          navigate("/captain/incoming-ride", { state: { ride } });
        });

        setIsOnline(true);
        
      },
      (error) => {
        console.log(error);

        alert("Location permission required");
      },
    );
  };

  const goOffline = () => {
    socket.disconnect();

    setIsOnline(false);
  };

  useEffect(() => {
    socket.on("new-ride", (ride) => {
      console.log("NEW RIDE RECEIVED =>", ride);

      navigate("/captain/incoming-ride", {
        state: {
          ride,
        },
      });
    });

    return () => {
      socket.off("new-ride");
    };
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Captain Dashboard</h1>

      <h2>
        Status:
        {isOnline ? " 🟢 Online" : " 🔴 Offline"}
      </h2>

      {!isOnline ? (
        <button onClick={goOnline}>Go Online</button>
      ) : (
        <button onClick={goOffline}>Go Offline</button>
      )}
    </div>
  );
}

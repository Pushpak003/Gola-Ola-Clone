import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CompleteProfile() {
  const navigate = useNavigate();

  const [fullname, setFullname] =
    useState("");
  const [phone, setPhone] =
    useState("");

  const [vehicleType, setVehicleType] =
    useState("BIKE");

  const [vehicleNumber,
    setVehicleNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit =
    async () => {

      try {

        setLoading(true);

        const response =
          await api.post(
            "/captain/complete-profile",
            {
              fullname,
              vehicleType,
              vehicleNumber,
              phone,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem(
                    "captainToken"
                  )}`,
              },
            }
          );

        localStorage.setItem(
          "captainToken",
          response.data.token
        );

        navigate(
          "/captain/dashboard"
        );

      } catch (error) {

        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            "Profile update failed"
        );

      } finally {

        setLoading(false);

      }

    };

  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <h1>
        Complete Profile
      </h1>

      <input
        type="text"
        placeholder="Full Name"
        value={fullname}
        onChange={(e) =>
          setFullname(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <select
        value={vehicleType}
        onChange={(e) =>
          setVehicleType(
            e.target.value
          )
        }
      >
        <option value="BIKE">
          BIKE
        </option>

        <option value="AUTO">
          AUTO
        </option>

        <option value="MINI">
          MINI
        </option>
      </select>

      <br />
      <br />

      <input
        type="text"
        placeholder="Vehicle Number"
        value={vehicleNumber}
        onChange={(e) =>
          setVehicleNumber(
            e.target.value
          )
        }
      />
      
      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) =>
          setPhone(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : "Complete Profile"}
      </button>
    </div>
  );
}
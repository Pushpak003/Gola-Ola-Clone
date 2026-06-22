import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../user/Login";
import Home from "../user/Home";
import VehicleSelection from "../user/vehicleSelection";
import SearchingRide from "../user/SearchingRide";
import UserLiveRide from "../user/LiveRide";
import UserHistory from "../user/History";
import PaymentPage from "../user/PaymentPage";
import PaymentSuccess from "../user/PaymentSuccess";
import Landing from "../pages/Landing";

// User route guard: checks only token + userRole
const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  if (!token || role !== "user") return <Navigate to="/login" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* User protected */}
      <Route path="/home" element={<UserRoute><Home /></UserRoute>} />
      <Route path="/vehicle-selection" element={<UserRoute><VehicleSelection /></UserRoute>} />
      <Route path="/user/searching-ride" element={<UserRoute><SearchingRide /></UserRoute>} />
      <Route path="/user/live-ride" element={<UserRoute><UserLiveRide /></UserRoute>} />
      <Route path="/user/history" element={<UserRoute><UserHistory /></UserRoute>} />
      <Route path="/user/payment" element={<UserRoute><PaymentPage /></UserRoute>} />
      <Route path="/user/payment-success" element={<UserRoute><PaymentSuccess /></UserRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
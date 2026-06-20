import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../user/Login";
import Home from "../user/Home";
import Landing from "../pages/Landing";
import CaptainLogin from "../captain/CaptainLogin";
import Dashboard from "../captain/Dashboard";
import VehicleSelection from "../user/vehicleSelection";
import SearchingRide from "../user/SearchingRide";
import UserLiveRide from "../user/LiveRide";
import UserHistory from "../user/History";
import IncomingRide from "../captain/IncomingRide";
import CompleteProfile from "../captain/CompleteProfile";
import CaptainLiveRide from "../captain/CaptainLiveRide";
import CaptainHistory from "../captain/Captainhistory";
import PaymentPage from "../user/PaymentPage";
import PaymentSuccess from "../user/PaymentSuccess";

// ── User route guard: checks only "token" + "userRole" ─────────────────────
const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  if (!token || role !== "user") return <Navigate to="/login" replace />;
  return children;
};

// ── Captain route guard: checks only "captainToken" + "captainRole" ────────
const CaptainRoute = ({ children }) => {
  const token = localStorage.getItem("captainToken");
  const role = localStorage.getItem("captainRole");
  if (!token || role !== "captain") return <Navigate to="/captain/login" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/captain/login" element={<CaptainLogin />} />
      <Route path="/captain/complete-profile" element={<CompleteProfile />} />

      {/* User protected */}
      <Route path="/home" element={<UserRoute><Home /></UserRoute>} />
      <Route path="/vehicle-selection" element={<UserRoute><VehicleSelection /></UserRoute>} />
      <Route path="/user/searching-ride" element={<UserRoute><SearchingRide /></UserRoute>} />
      <Route path="/user/live-ride" element={<UserRoute><UserLiveRide /></UserRoute>} />
      <Route path="/user/history" element={<UserRoute><UserHistory /></UserRoute>} />
      <Route path="/user/payment" element={<UserRoute><PaymentPage /></UserRoute>} />
      <Route path="/user/payment-success" element={<UserRoute><PaymentSuccess /></UserRoute>} />

      {/* Captain protected — IncomingRide can come from a socket push while on dashboard */}
      <Route path="/captain/dashboard" element={<CaptainRoute><Dashboard /></CaptainRoute>} />
      <Route path="/captain/incoming-ride" element={<CaptainRoute><IncomingRide /></CaptainRoute>} />
      <Route path="/captain/live-ride" element={<CaptainRoute><CaptainLiveRide /></CaptainRoute>} />
      <Route path="/captain/history" element={<CaptainRoute><CaptainHistory /></CaptainRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
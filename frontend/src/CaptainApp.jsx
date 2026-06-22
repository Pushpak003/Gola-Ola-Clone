import { Routes, Route, Navigate } from "react-router-dom";
import CaptainLogin from "./captain/CaptainLogin";
import Dashboard from "./captain/Dashboard";
import IncomingRide from "./captain/IncomingRide";
import CompleteProfile from "./captain/CompleteProfile";
import CaptainLiveRide from "./captain/CaptainLiveRide";
import CaptainHistory from "./captain/Captainhistory";

// Captain route guard
const CaptainRoute = ({ children }) => {
  const token = localStorage.getItem("captainToken");
  const role = localStorage.getItem("captainRole");
  if (!token || role !== "captain") return <Navigate to="/login" replace />;
  return children;
};

export default function CaptainApp() {
  return (
    <Routes>
      <Route path="/login" element={<CaptainLogin />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/dashboard" element={<CaptainRoute><Dashboard /></CaptainRoute>} />
      <Route path="/incoming-ride" element={<CaptainRoute><IncomingRide /></CaptainRoute>} />
      <Route path="/live-ride" element={<CaptainRoute><CaptainLiveRide /></CaptainRoute>} />
      <Route path="/history" element={<CaptainRoute><CaptainHistory /></CaptainRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
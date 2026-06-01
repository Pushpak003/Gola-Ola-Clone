import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../user/Login";
import Home from "../user/Home";
import Landing from "../pages/Landing";
import CaptainLogin from "../captain/Captainlogin";
import Dashboard from "../captain/Dashboard";
import VehicleSelection from "../user/vehicleSelection";
import SearchingRide from "../user/SearchingRide";
import UserLiveRide from "../user/LiveRide";
import UserHistory from "../user/History";
import IncomingRide from "../captain/IncomingRide";
import CompleteProfile from "../captain/CompleteProfile";
import CaptainLiveRide from "../captain/captainliveride";
import CaptainHistory from "../captain/Captainhistory";

const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "user") return <Navigate to="/login" replace />;
  return children;
};

const CaptainRoute = ({ children }) => {
  const token = localStorage.getItem("captainToken") || localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "captain") return <Navigate to="/captain/login" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/captain/login" element={<CaptainLogin />} />
      <Route path="/captain/complete-profile" element={<CompleteProfile />} />
      <Route path="/captain/incoming-ride" element={<IncomingRide />} />

      <Route path="/home" element={<UserRoute><Home /></UserRoute>} />
      <Route path="/vehicle-selection" element={<UserRoute><VehicleSelection /></UserRoute>} />
      <Route path="/user/searching-ride" element={<UserRoute><SearchingRide /></UserRoute>} />
      <Route path="/user/live-ride" element={<UserRoute><UserLiveRide /></UserRoute>} />
      <Route path="/user/history" element={<UserRoute><UserHistory /></UserRoute>} />

      <Route path="/captain/dashboard" element={<CaptainRoute><Dashboard /></CaptainRoute>} />
      <Route path="/captain/live-ride" element={<CaptainRoute><CaptainLiveRide /></CaptainRoute>} />
      <Route path="/captain/history" element={<CaptainRoute><CaptainHistory /></CaptainRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
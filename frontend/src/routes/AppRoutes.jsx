import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../user/Login";
import Home from "../user/Home";
import Landing from "../pages/Landing";
import CaptainLogin from "../captain/Login";
import Dashboard from "../captain/Dashboard";
import VehicleSelection from "../user/VehicleSelection";
import SearchingRide from "../user/SearchingRide";
import LiveRide from "../user/LiveRide";
import IncomingRide from "../captain/IncomingRide";
import CompleteProfile from "../captain/CompleteProfile";
// 🔐 User Protected Route: Sirf users ke liye
const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "user") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 🔐 Captain Protected Route: Sirf driver/captain ke liye
const CaptainRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "captain") {
    return <Navigate to="/captain/login" replace />;
  }
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/captain/login" element={<CaptainLogin />} />

      {/* Development/Testing Helper Route */}
      <Route path="/vehicle-selection" element={<VehicleSelection />} />

      {/* Protected User Dashboard */}
      <Route
        path="/home"
        element={
          <UserRoute>
            <Home />
          </UserRoute>
        }
      />
      <Route path="/captain/incoming-ride" element={<IncomingRide />} />
      <Route path="/captain/complete-profile" element={<CompleteProfile />} />

      {/* Protected Captain Dashboard */}
      <Route
        path="/captain/dashboard"
        element={
          <CaptainRoute>
            <Dashboard />
          </CaptainRoute>
        }
      />
      <Route
        path="/user/searching-ride"
        element={
          <UserRoute>
            <SearchingRide />
          </UserRoute>
        }
      />
      <Route
        path="/user/live-ride"
        element={
          <UserRoute>
            <LiveRide />
          </UserRoute>
        }
      />

      {/* Agar koi galat URL daale toh seedhe landing pe patko */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

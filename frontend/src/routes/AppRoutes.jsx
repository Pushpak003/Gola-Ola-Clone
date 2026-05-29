import { Routes, Route } from "react-router-dom";

import Login from "../user/Login";
import Home from "../user/Home";
import Landing from "../pages/Landing";

import CaptainLogin from "../captain/Login";
import Dashboard from "../captain/Dashboard";
import VehicleSelection from "../user/VehicleSelection";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/vehicle-selection" element={<VehicleSelection />} />

      <Route path="/home" element={<Home />} />

      <Route path="/captain/login" element={<CaptainLogin />} />

      <Route path="/captain/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

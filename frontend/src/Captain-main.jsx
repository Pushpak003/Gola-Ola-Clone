import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./captain-theme.css";
import CaptainApp from "./CaptainApp";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CaptainApp />
  </BrowserRouter>
);
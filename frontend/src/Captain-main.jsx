import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./Captain-theme.css";
import CaptainApp from "./CaptainApp";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <CaptainApp />
  </HashRouter>
);

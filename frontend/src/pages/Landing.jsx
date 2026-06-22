import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing__top">
        <span className="landing__logo">GOLA</span>
        <p className="landing__tagline">Your city, your ride.</p>
      </div>

      <div className="landing__cards">
        {/* User card */}
        <div className="landing__card landing__card--user" onClick={() => navigate("/login")}>
          <div className="landing__card-icon">🚕</div>
          <div className="landing__card-content">
            <h2 className="landing__card-title">Ride with Gola</h2>
            <p className="landing__card-sub">Book a ride to anywhere in the city</p>
          </div>
          <div className="landing__card-arrow">→</div>
        </div>

        {/* Captain card — opens captain.html (separate app) */}
        <div
          className="landing__card landing__card--captain"
          onClick={() => window.location.href = "/captain.html"}
        >
          <div className="landing__card-icon">🏍️</div>
          <div className="landing__card-content">
            <h2 className="landing__card-title">Drive with Gola</h2>
            <p className="landing__card-sub">Earn on your own schedule as a captain</p>
          </div>
          <div className="landing__card-arrow">→</div>
        </div>
      </div>

      <p className="landing__footer">
        Trusted by 10,000+ riders across Central India
      </p>
    </div>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Background grid pattern */}
      <div className="landing__grid" />

      {/* Top bar */}
      <div className="landing__topbar">
        <span className="landing__logo">GOLA</span>
      </div>

      {/* Hero content */}
      <div className="landing__hero">
        <div className="landing__badge">🏙️ Now Live in Bhopal</div>
        <h1 className="landing__title">
          Your city.<br />
          <span className="landing__title--accent">Your ride.</span>
        </h1>
        <p className="landing__subtitle">
          Fast, safe, and affordable rides at your fingertips — anytime, anywhere.
        </p>

        {/* Floating vehicle icons */}
        <div className="landing__vehicles">
          <div className="landing__vehicle">🚗</div>
          <div className="landing__vehicle">🛺</div>
          <div className="landing__vehicle">🏍️</div>
        </div>
      </div>

      {/* Bottom CTA card */}
      <div className="landing__card animate-slide-up">
        <h2 className="landing__card-title">Get moving today</h2>
        <p className="landing__card-sub">Book in seconds. No surge pricing surprises.</p>

        <div className="landing__actions">
          <button
            className="landing__btn landing__btn--primary"
            onClick={() => navigate('/login')}
          >
            <span>Book a Ride</span>
            <span className="landing__btn-icon">→</span>
          </button>

          <button
            className="landing__btn landing__btn--secondary"
            onClick={() => navigate('/captain/login')}
          >
            <span>Drive with Gola</span>
            <span className="landing__btn-icon">🏍️</span>
          </button>
        </div>

        <p className="landing__fine">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Landing;
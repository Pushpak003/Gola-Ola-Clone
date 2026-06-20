import { useLocation, useNavigate } from "react-router-dom";
import "./Ride.css";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ride = state?.ride;
  const paymentId = state?.paymentId;

  return (
    <div className="liveride liveride--done">
      <div className="liveride__done-icon">✅</div>
      <h1 className="liveride__done-title">Payment Successful!</h1>
      <p className="liveride__done-sub">Thank you for riding with Gola.</p>

      {paymentId && (
        <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
          Ref: {paymentId}
        </p>
      )}

      {ride && (
        <div className="liveride__done-fare">
          <span className="liveride__done-fare-label">Total Paid</span>
          <span className="liveride__done-fare-val">₹{Math.round(ride.fare)}</span>
        </div>
      )}

      <button className="liveride__home-btn" onClick={() => navigate("/home")}>
        Back to Home →
      </button>
      <button
        style={{ marginTop: 12, background: "transparent", border: "none", color: "#666", fontSize: 14, cursor: "pointer", textDecoration: "underline" }}
        onClick={() => navigate("/user/history")}
      >
        View Ride History
      </button>
    </div>
  );
}
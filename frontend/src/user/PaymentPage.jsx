import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userAPI } from "../api/axios";
import "./Ride.css";

// Razorpay checkout is loaded from CDN
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ride = state?.ride;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ride) navigate("/home", { replace: true });
  }, [ride, navigate]);

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment SDK. Check your connection.");

      // 1. Create order on backend
      const { data } = await userAPI.post("/payment/create-order", { rideId: ride.id });
      if (!data.success) throw new Error(data.message);
      const order = data.order;

      // 2. Open Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Gola",
        description: `Ride from ${ride.pickup} to ${ride.destination}`,
        order_id: order.orderId,
        handler: async (response) => {
          // 3. Verify signature on backend
          try {
            const verify = await userAPI.post("/payment/verify", {
              rideId: ride.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verify.data.success) {
              navigate("/user/payment-success", {
                state: { ride, paymentId: response.razorpay_payment_id },
              });
            } else {
              setError("Payment verification failed. Contact support.");
            }
          } catch {
            setError("Payment verification failed. Please retry.");
          }
        },
        prefill: {
          contact: ride.userPhone || "",
        },
        theme: { color: "#0a0a0a" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Please retry.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!ride) return null;

  return (
    <div className="liveride liveride--done">
      <div className="liveride__done-icon">💳</div>
      <h1 className="liveride__done-title">Pay for your Ride</h1>
      <p className="liveride__done-sub" style={{ marginBottom: 8 }}>
        {ride.pickup} → {ride.destination}
      </p>

      <div className="liveride__done-fare">
        <span className="liveride__done-fare-label">Amount Due</span>
        <span className="liveride__done-fare-val">₹{Math.round(ride.fare)}</span>
      </div>

      {error && (
        <div style={{
          background: "#fff5f5",
          border: "1.5px solid #fed7d7",
          color: "#c53030",
          padding: "12px 16px",
          borderRadius: 10,
          fontSize: 14,
          marginBottom: 16,
          width: "100%",
          boxSizing: "border-box",
        }}>
          ⚠️ {error}
        </div>
      )}

      <button
        className="liveride__home-btn"
        onClick={handlePay}
        disabled={loading}
        style={{ background: loading ? "#888" : "#0a0a0a" }}
      >
        {loading ? "Processing..." : "Pay ₹" + Math.round(ride.fare) + " →"}
      </button>

      <button
        style={{
          marginTop: 12,
          background: "transparent",
          border: "none",
          color: "#666",
          fontSize: 14,
          cursor: "pointer",
          textDecoration: "underline",
        }}
        onClick={() => navigate("/home")}
      >
        Pay Later (Cash)
      </button>
    </div>
  );
}
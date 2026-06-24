import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userAPI } from "../api/axios";
import "./Ride.css";

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
      // 1. Create order on backend first
      let order;
      try {
        const { data } = await userAPI.post("/payment/create-order", { rideId: ride.id });
        if (!data.success) throw new Error(data.message);
        order = data.order;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Could not create payment order";
        setError(msg);
        setLoading(false);
        return;
      }

      // DEV MODE: Razorpay keys not configured — skip Razorpay entirely
      if (order.devMode) {
        try {
          await userAPI.post("/payment/dev-complete", { rideId: ride.id });
        } catch { /* ignore — dev mode */ }
        navigate("/user/payment-success", {
          state: { ride, paymentId: order.orderId },
        });
        return;
      }

      // 2. Load Razorpay script (only when we have a real order)
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Payment SDK load failed. Check your internet connection.");
        setLoading(false);
        return;
      }
      // Note: DO NOT put setLoading(false) in finally — modal is async
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Gola",
        description: `${ride.pickup} → ${ride.destination}`,
        order_id: order.orderId,
        handler: async (response) => {
          // 4. Verify on backend
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
              setError("Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch {
            setError("Payment verified on gateway but server error. Contact support.");
            setLoading(false);
          }
        },
        prefill: { contact: ride.userPhone || "" },
        theme: { color: "#0a0a0a" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. You can retry or pay by cash.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Please retry.");
        setLoading(false);
      });
      rzp.open();
      // Don't setLoading(false) here — modal is open, loading=true means "processing"

    } catch (err) {
      setError(err.message || "Something went wrong. Please retry.");
      setLoading(false);
    }
  };

  const handleCash = () => {
    navigate("/home");
  };

  if (!ride) return null;

  return (
    <div className="liveride liveride--done">
      <div className="liveride__done-icon">💳</div>
      <h1 className="liveride__done-title">Pay for your Ride</h1>
      <p className="liveride__done-sub">
        {ride.pickup} → {ride.destination}
      </p>

      <div className="liveride__done-fare">
        <span className="liveride__done-fare-label">Amount Due</span>
        <span className="liveride__done-fare-val">₹{Math.round(ride.fare)}</span>
      </div>

      {error && (
        <div className="payment__error">⚠️ {error}</div>
      )}

      <button
        className="liveride__home-btn"
        onClick={handlePay}
        disabled={loading}
      >
        {loading
          ? <><span className="g-spinner" style={{ marginRight: 8 }} /> Processing...</>
          : `Pay ₹${Math.round(ride.fare)} Online →`}
      </button>

      <div className="payment__divider">
        <span>or</span>
      </div>

      <button className="payment__cash-btn" onClick={handleCash}>
        💵 Pay by Cash to Captain
      </button>

      <p className="payment__note">Cash payment doesn't require any action here</p>
    </div>
  );
}
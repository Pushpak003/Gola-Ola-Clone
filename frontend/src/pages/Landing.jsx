import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">GOLA 🚖</h1>

      <p>Fast, Reliable & Affordable Rides</p>

      <button onClick={() => navigate("/login")}>Continue as Rider</button>

      <button onClick={() => navigate("/captain/login")}>
        Continue as Captain
      </button>
    </div>
  );
}

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import mapRoutes from "./routes/map.routes.js";
import rideRoutes from "./routes/ride.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

// Raw body needed for Razorpay webhook signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
// All other routes use JSON
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') return next();
  express.json()(req, res, next);
});

// Single CORS config — not duplicated
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/captain", captainRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/ride", rideRoutes);
app.use("/api/payment", paymentRoutes);

export default app;
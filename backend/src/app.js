import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import mapRoutes from "./routes/map.routes.js";
import rideRoutes from "./routes/ride.routes.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cors({origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  credentials: false,}));

app.use("/api/auth", authRoutes);
app.use("/api/captain", captainRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/ride", rideRoutes);
export default app;

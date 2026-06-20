import express from "express";
import {
  createOrder,
  verifyPayment,
  webhook,
  getPaymentStatus,
} from "../controllers/payment.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { captainAuth } from "../middlewares/captainAuth.middleware.js";

const router = express.Router();

// User: create Razorpay order for completed ride
router.post("/create-order", userAuth, createOrder);

// User: verify payment signature after checkout
router.post("/verify", userAuth, verifyPayment);

// Captain: check if ride is paid
router.get("/status/:rideId", captainAuth, getPaymentStatus);

// Razorpay webhook — no auth (Razorpay signs with HMAC)
router.post("/webhook", webhook);

export default router;
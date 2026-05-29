import express from "express";
import { getFare, createRide, acceptRide } from "../controllers/ride.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import {captainAuth} from "../middlewares/captainAuth.middleware.js";
const router = express.Router();

router.get("/fare", getFare);
router.post("/create", userAuth, createRide);
router.post("/accept", captainAuth, acceptRide);

export default router;

import express from "express";
import { getFare, createRide, acceptRide, getCaptainCurrentRide } from "../controllers/ride.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import {captainAuth} from "../middlewares/captainAuth.middleware.js";
import { startRide,completeRide } from "../controllers/ride.controller.js";
import { getRideHistory, getCaptainHistory } from "../controllers/ride.controller.js";
import { getCurrentRide } from "../controllers/ride.controller.js";
const router = express.Router();

router.get("/fare", userAuth, getFare); // FIX: protect Mapbox quota
router.post("/create", userAuth, createRide);
router.post("/accept", captainAuth, acceptRide);
router.post("/start", captainAuth, startRide);
router.post("/complete", captainAuth, completeRide);
router.get("/history", userAuth, getRideHistory);
router.get("/captainhistory", captainAuth, getCaptainHistory);
router.get("/current", userAuth, getCurrentRide);
router.get("/captain-current", captainAuth, getCaptainCurrentRide);
export default router;
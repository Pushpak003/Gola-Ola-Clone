import express from "express";
import { getFare, createRide } from "../controllers/ride.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
const router = express.Router();

router.get("/fare", getFare);
router.post("/create", userAuth, createRide);

export default router;

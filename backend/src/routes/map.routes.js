import express from "express";
import { searchPlaces, getDistance } from "../controllers/map.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";

const router = express.Router();

// FIX: Both map endpoints now require user JWT to protect Mapbox quota
router.get("/search", userAuth, searchPlaces);
router.get("/distance", userAuth, getDistance);

export default router;
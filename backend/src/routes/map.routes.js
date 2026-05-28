import express from "express";
import { searchPlaces, getDistance } from "../controllers/map.controller.js";

const router = express.Router();

router.get("/search", searchPlaces);
router.get("/distance", getDistance);

export default router;

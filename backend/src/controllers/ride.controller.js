import {
  getFareService,
  createRideService,
  acceptRideService,
  startRideService,
  completeRideService,
  getRideHistoryService,
  getCaptainRideHistoryService,   // FIX: was missing from imports
  getCurrentRideService,
  getCaptainCurrentRideService,
} from "../services/ride.service.js";

export const getFare = async (req, res) => {
  try {
    const { pickupLng, pickupLat, destinationLng, destinationLat } = req.query;
    const data = await getFareService(pickupLng, pickupLat, destinationLng, destinationLat);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createRide = async (req, res) => {
  try {
    const { pickup, destination, pickupLat, pickupLng, destinationLat, destinationLng, vehicleType } = req.body;
    const ride = await createRideService({
      userId: req.user.id, pickup, destination,
      pickupLat, pickupLng, destinationLat, destinationLng, vehicleType,
    });
    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await acceptRideService({ rideId, captainId: req.captain.id });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const startRide = async (req, res) => {
  try {
    const { rideId, otp } = req.body;
    const ride = await startRideService({ rideId, otp, captainId: req.captain.id });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await completeRideService({ rideId, captainId: req.captain.id });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRideHistory = async (req, res) => {
  try {
    const rides = await getRideHistoryService(req.user.id);
    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCaptainHistory = async (req, res) => {
  try {
    // FIX: was calling getCaptainRideHistoryService but it wasn't imported
    const rides = await getCaptainRideHistoryService(req.captain.id);
    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCurrentRide = async (req, res) => {
  try {
    const ride = await getCurrentRideService(req.user.id);
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCaptainCurrentRide = async (req, res) => {
  try {
    const ride = await getCaptainCurrentRideService(req.captain.id);
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
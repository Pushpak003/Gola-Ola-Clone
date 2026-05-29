import { getFareService } from "../services/ride.service.js";
import { createRideService } from "../services/ride.service.js";
import {acceptRideService} from "../services/ride.service.js";
export const getFare = async (req, res) => {
  try {
    const { pickupLng, pickupLat, destinationLng, destinationLat } = req.query;

    const data = await getFareService(
      pickupLng,
      pickupLat,
      destinationLng,
      destinationLat,
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const acceptRide =
async (req, res) => {

  try {

    const { rideId } =
      req.body;

    const ride =
      await acceptRideService({

        rideId,

        captainId:
          req.captain.id,
      });

    res.status(200).json({
      success: true,
      ride,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message:
        error.message,
    });

  }

};
export const createRide = async (req, res) => {
  try {
    const {
      pickup,
      destination,

      pickupLat,
      pickupLng,

      destinationLat,
      destinationLng,

      vehicleType,
    } = req.body;

    const ride = await createRideService({
      userId: req.user.id,

      pickup,
      destination,

      pickupLat,
      pickupLng,

      destinationLat,
      destinationLng,

      vehicleType,
    });

    res.status(201).json({
      success: true,
      ride,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

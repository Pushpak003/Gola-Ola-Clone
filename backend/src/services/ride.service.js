import { getDistanceService } from "./map.service.js";
import { calculateFare } from "../utils/calculateFare.js";
import { generateRideOTP } from "../utils/generateRideOTP.js";
import prisma from "../config/db.js";
export const getFareService = async (
  pickupLng,
  pickupLat,
  destinationLng,
  destinationLat,
) => {
  const routeData = await getDistanceService(
    pickupLng,
    pickupLat,
    destinationLng,
    destinationLat,
  );

  const fares = calculateFare(routeData.distance);

  return {
    distance: routeData.distance,

    duration: routeData.duration,

    fares,
  };
};
export const createRideService =
async ({
  userId,

  pickup,
  destination,

  pickupLat,
  pickupLng,

  destinationLat,
  destinationLng,

  vehicleType,
}) => {

  const routeData =
    await getDistanceService(
      pickupLng,
      pickupLat,
      destinationLng,
      destinationLat
    );

  const fares =
    calculateFare(
      routeData.distance
    );

  const fare =
    fares[vehicleType];

  if (!fare) {
    throw new Error(
      "Invalid vehicle type"
    );
  }

  const otp =
    generateRideOTP();

  const ride =
    await prisma.ride.create({
      data: {

        userId,

        pickup,
        destination,

        pickupLat,
        pickupLng,

        destinationLat,
        destinationLng,

        distance:
          routeData.distance,

        duration:
          Math.ceil(
            routeData.duration
          ),

        fare,

        vehicleType,

        otp,

        status:
          "SEARCHING",
      },
    });

  return ride;

};

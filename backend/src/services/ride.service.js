import { getDistanceService } from "./map.service.js";
import { calculateFare } from "../utils/calculateFare.js";
import { generateRideOTP } from "../utils/generateRideOTP.js";
import { getNearbyDrivers } from "../utils/getNearbyDrivers.js";
import {onlineUsers} from "../sockets/onlineUsers.js";
import { getIo } from "../sockets/socket.js";
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

export const createRideService = async ({
  userId,

  pickup,
  destination,

  pickupLat,
  pickupLng,

  destinationLat,
  destinationLng,

  vehicleType,
}) => {
  const routeData = await getDistanceService(
    pickupLng,
    pickupLat,
    destinationLng,
    destinationLat,
  );

  const fares = calculateFare(routeData.distance);

  const fare = fares[vehicleType];

  if (!fare) {
    throw new Error("Invalid vehicle type");
  }

  const otp = generateRideOTP();

  const ride = await prisma.ride.create({
    data: {
      userId,

      pickup,
      destination,

      pickupLat,
      pickupLng,

      destinationLat,
      destinationLng,

      distance: routeData.distance,
      duration: Math.ceil(routeData.duration),
      fare,
      vehicleType,
      otp,
      status: "SEARCHING",
    },
  });
  const nearbyDrivers = getNearbyDrivers({
    lat: pickupLat,
    lng: pickupLng,
    vehicleType,
  });

  const io = getIo();

  for (const driver of nearbyDrivers) {
    io.to(driver.socketId).emit("new-ride", ride);
  }
  return ride;
};
export const acceptRideService = async ({ rideId, captainId }) => {
  const ride = await prisma.ride.findUnique({
    where: {
      id: rideId,
    },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "SEARCHING") {
    throw new Error("Ride already accepted");
  }

  const updatedRide = await prisma.ride.update({
    where: {
      id: rideId,
    },

    data: {
      captainId,
      status: "ACCEPTED",
    },
  });
    const userSocketId =
    onlineUsers.get(
      ride.userId
    );

  if (userSocketId) {

    const io = getIo();

    io.to(
      userSocketId
    ).emit(
      "ride-confirmed",
      updatedRide
    );

  }

  return updatedRide;
};


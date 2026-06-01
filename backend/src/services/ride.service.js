import { getDistanceService } from "./map.service.js";
import { calculateFare } from "../utils/calculateFare.js";
import { generateRideOTP } from "../utils/generateRideOTP.js";
import { getNearbyDrivers } from "../utils/getNearbyDrivers.js";
import { onlineUsers } from "../sockets/onlineUsers.js";
import { onlineDrivers } from "../sockets/onlineDrivers.js";
import { sendSMS } from "./sms.service.js";
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
  return { distance: routeData.distance, duration: routeData.duration, fares };
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
  const activeRide = await prisma.ride.findFirst({
    where: { userId, status: { in: ["SEARCHING", "ACCEPTED", "STARTED"] } },
  });
  if (activeRide) throw new Error("You already have an active ride");

  const routeData = await getDistanceService(
    pickupLng,
    pickupLat,
    destinationLng,
    destinationLat,
  );
  const fares = calculateFare(routeData.distance);
  const fare = fares[vehicleType];
  if (!fare) throw new Error("Invalid vehicle type");

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
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  await sendSMS(user.phone, otp);

  console.log("RIDE OTP SENT =>", otp);

  // Auto-cancel if no captain accepts in 15s
  setTimeout(async () => {
    const current = await prisma.ride.findUnique({ where: { id: ride.id } });
    if (current && current.status === "SEARCHING") {
      await prisma.ride.update({
        where: { id: ride.id },
        data: { status: "CANCELLED" },
      });
      console.log("Ride timed out:", ride.id);
    }
  }, 60000);

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
  const result = await prisma.ride.updateMany({
    where: { id: rideId, status: "SEARCHING" },
    data: { captainId, status: "ACCEPTED" },
  });
  if (result.count === 0) throw new Error("Ride already accepted");

  const updatedRide = await prisma.ride.findUnique({ where: { id: rideId } });

  const driver = onlineDrivers.get(captainId);
  if (driver) driver.isAvailable = false;

  const userSocketId = onlineUsers.get(updatedRide.userId);
  if (userSocketId) {
    getIo().to(userSocketId).emit("ride-confirmed", updatedRide);
  }
  return updatedRide;
};

export const startRideService = async ({ rideId, captainId, otp }) => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new Error("Ride not found");
  if (ride.captainId !== captainId) throw new Error("Unauthorized");
  if (ride.status !== "ACCEPTED") throw new Error("Ride cannot be started");
  if (ride.otp !== otp) throw new Error("Invalid OTP");

  const updatedRide = await prisma.ride.update({
    where: { id: rideId },
    data: { status: "STARTED" },
  });

  // FIX: Emit ride-started to user so LiveRide page knows ride began
  const userSocketId = onlineUsers.get(ride.userId);
  if (userSocketId) {
    getIo().to(userSocketId).emit("ride-started", updatedRide);
  }

  return updatedRide;
};

export const completeRideService = async ({ rideId, captainId }) => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new Error("Ride not found");
  if (ride.captainId !== captainId) throw new Error("Unauthorized");
  if (ride.status !== "STARTED") throw new Error("Ride not started");

  const updatedRide = await prisma.ride.update({
    where: { id: rideId },
    data: { status: "COMPLETED" },
  });

  const userSocketId = onlineUsers.get(updatedRide.userId);
  if (userSocketId) {
    getIo().to(userSocketId).emit("ride-completed", updatedRide);
    console.log("ride-completed emitted to:", userSocketId);
  }

  const driver = onlineDrivers.get(captainId);
  if (driver) driver.isAvailable = true;

  return updatedRide;
};

export const getRideHistoryService = async (userId) => {
  return prisma.ride.findMany({
    where: { userId },
    include: { captain: true },
    orderBy: { createdAt: "desc" },
  });
};

// FIX: was being imported in controller but service function name mismatch
export const getCaptainRideHistoryService = async (captainId) => {
  return prisma.ride.findMany({
    where: { captainId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getCurrentRideService = async (userId) => {
  return prisma.ride.findFirst({
    where: { userId, status: { in: ["SEARCHING", "ACCEPTED", "STARTED"] } },
    include: { captain: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getCaptainCurrentRideService = async (captainId) => {
  return prisma.ride.findFirst({
    where: { captainId, status: { in: ["ACCEPTED", "STARTED"] } },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
};

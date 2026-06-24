import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { onlineDrivers } from "./onlineDrivers.js";
import { onlineUsers } from "./onlineUsers.js";

let io;
export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // CAPTAIN ONLINE
    socket.on("captain-online", async (data) => {
      try {
        const { token, lat, lng } = data;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await prisma.captain.findUnique({ where: { id: decoded.id } });
        if (!captain) return;

        onlineDrivers.set(captain.id, {
          socketId: socket.id,
          lat,
          lng,
          vehicleType: captain.vehicleType,
          isAvailable: true,
        });
        console.log("Captain online:", captain.id);
      } catch (error) {
        console.log("captain-online error:", error.message);
      }
    });

    // USER ONLINE
    socket.on("user-online", async (data) => {
      try {
        const { token } = data;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return;

        onlineUsers.set(user.id, socket.id);
        console.log("User online:", user.id);
      } catch (error) {
        console.log("user-online error:", error.message);
      }
    });

    // CAPTAIN LOCATION UPDATE
    // FIX: Use in-memory rideUserMap instead of DB query on every tick
    socket.on("captain-location", (data) => {
      try {
        const { rideId, lat, lng, userId } = data;
        if (!rideId || !userId) return;

        const userSocketId = onlineUsers.get(userId);
        if (!userSocketId) return;

        io.to(userSocketId).emit("captain-location-update", { rideId, lat, lng });
      } catch (error) {
        console.log("captain-location error:", error.message);
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (const [captainId, driverData] of onlineDrivers) {
        if (driverData.socketId === socket.id) {
          onlineDrivers.delete(captainId);
          break;
        }
      }
      for (const [userId, socketId] of onlineUsers) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export const getIo = () => io;
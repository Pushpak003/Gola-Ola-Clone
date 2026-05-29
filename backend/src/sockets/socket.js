import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { onlineDrivers } from "./onlineDrivers.js";
import { onlineUsers } from "./onlineUsers.js";

let io;
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
 
    // CAPTAIN ONLINE
    socket.on("captain-online", async (data) => {
      try {
        const { token, lat, lng } = data;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await prisma.captain.findUnique({
          where: {
            id: decoded.id,
          },
        });
        if (!captain) return;

        onlineDrivers.set(captain.id, {
          socketId: socket.id,

          lat,
          lng,

          vehicleType: captain.vehicleType,
        });
        console.log("Online Drivers:");

        console.log(onlineDrivers);
      } catch (error) {
        console.log(error);
      }
    });

    // USER ONLINE
    socket.on("user-online", async (data) => {
      try {
        const { token } = data;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
          where: {
            id: decoded.id,
          },
        });

        if (!user) return;

        onlineUsers.set(user.id, socket.id);

        console.log("Online Users:");

        console.log(onlineUsers);
      } catch (error) {
        console.log(error);
      }
    });
    // DISCONNECT
    
    socket.on("disconnect", () => {
      // driver cleanup
      for (const [captainId, driverData] of onlineDrivers) {
        if (driverData.socketId === socket.id) {
          onlineDrivers.delete(captainId);
          break;
        }
      }
      // user cleanup
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

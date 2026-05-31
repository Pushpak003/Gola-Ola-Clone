import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: false,   // backend cors() default has no credentials
  transports: ["websocket", "polling"], // try websocket first, fallback to polling
});

// Debug helpers — remove in production
socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));
socket.on("disconnect", (reason) => console.log("🔌 Socket disconnected:", reason));
import app from "./app.js";
import dotenv from "dotenv";
import { initSocket } from "./sockets/socket.js";
import http from "http";
dotenv.config();
const server = http.createServer(app);

initSocket(server);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);
});
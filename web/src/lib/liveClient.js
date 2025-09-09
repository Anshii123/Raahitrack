import { io } from "socket.io-client";

// connect to backend
const socket = io(import.meta.env.VITE_API_BASE || "http://localhost:8080", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Connected to socket.io server");
});

socket.on("bus_update", (bus) => {
  console.log("🚌 Bus update:", bus);
});

export default socket;

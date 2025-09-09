import { io } from "socket.io-client";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
let socket;

// ------------------ ROUTES ------------------
export async function getRoutes() {
  const res = await fetch(`${BASE}/api/routes`);
  if (!res.ok) throw new Error("getRoutes failed " + res.status);
  return res.json();
}

export async function getStops() {
  const res = await fetch(`${BASE}/api/stops`);
  if (!res.ok) throw new Error("getStops failed " + res.status);
  return res.json();
}

// ✅ NEW: get stops for a specific route
export async function getStopsForRoute(routeId) {
  const res = await fetch(`${BASE}/api/stops?routeId=${encodeURIComponent(routeId)}`);
  if (!res.ok) throw new Error("getStopsForRoute failed " + res.status);
  return res.json();
}

// ------------------ ROUTE DETAILS ------------------
export async function getScheduleForRoute(routeId) {
  const res = await fetch(`${BASE}/api/routes/${encodeURIComponent(routeId)}/schedule`);
  if (!res.ok) throw new Error("getScheduleForRoute failed " + res.status);
  return res.json();
}

// ------------------ ETA ------------------
export async function getEta(stopId) {
  const res = await fetch(`${BASE}/api/eta?stopId=${encodeURIComponent(stopId)}`);
  if (!res.ok) throw new Error("getEta failed " + res.status);
  return res.json();
}

// ------------------ LIVE BUSES ------------------
// SSE + Socket.IO hybrid
export function subscribeLiveBuses(onMessage) {
  if (!socket) {
    socket = io(BASE, { transports: ["websocket"] });
  }

  // Prefer Socket.IO
  socket.on("bus_update", (data) => {
    if (onMessage) onMessage({ event: "bus_update", data });
  });

  // Fallback to SSE
  const es = new EventSource(`${BASE}/api/live`);
  es.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (onMessage) onMessage(msg);
    } catch (err) {
      console.error("Bad SSE message", err);
    }
  };

  return () => {
    if (socket) socket.disconnect();
    es.close();
  };
}

// ------------------ VEHICLES FOR ROUTE ------------------
export async function getVehiclesForRoute(routeId) {
  const res = await fetch(`${BASE}/api/routes/${encodeURIComponent(routeId)}/vehicles`);
  if (!res.ok) throw new Error("getVehiclesForRoute failed " + res.status);
  return res.json();
}

// ------------------ DRIVER TELEMETRY ------------------
export function sendDriverLocation({ bus_id, route_id, lat, lon, speedKmph }) {
  if (!socket) {
    socket = io(BASE, { transports: ["websocket"] });
  }
  socket.emit("telemetry", {
    bus_id,
    route_id,
    lat,
    lon,
    speedKmph,
    ts: Date.now(),
  });
}

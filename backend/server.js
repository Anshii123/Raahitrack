// server.js – RaahiTrack backend
import express from "express";
import cors from "cors";
import compression from "compression";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { loadGTFS } from "./gtfs-loader.js";
import { mountTwilioRoutes } from "./twilio-webhooks.js";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(compression());
app.use(bodyParser.json({ limit: "256kb" }));

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN || "*", methods: ["GET", "POST"] },
});

// GTFS
const GTFS_FOLDER =
  process.env.GTFS_FOLDER || path.join(__dirname, "data", "gtfs");
let GTFS = loadGTFS(GTFS_FOLDER);

// State
const sseClients = new Set();
const buses = new Map();

// Health
app.get("/api/health", (_, res) => res.json({ ok: true }));

// ------------------ Stops ------------------
app.get("/api/stops", (req, res) => {
  const { routeId } = req.query; // ✅ optional filter

  let features = GTFS.stops.map((s) => {
    let inferredRouteId = null;

    // Try to infer route_id via stop_times → trips → route
    const st = GTFS.stopTimes.find((st) => st.stop_id === s.stop_id);
    if (st) {
      const trip = GTFS.trips.find((t) => t.trip_id === st.trip_id);
      if (trip) inferredRouteId = trip.route_id;
    }

    return {
      type: "Feature",
      properties: {
        stop_id: s.stop_id,
        name: s.stop_name,
        route_id: inferredRouteId || null,
      },
      geometry: {
        type: "Point",
        coordinates: [Number(s.stop_lon), Number(s.stop_lat)],
      },
    };
  });

  // ✅ If ?routeId=... is passed, filter stops
  if (routeId) {
    features = features.filter(
      (f) => f.properties.route_id === routeId
    );
  }

  res.json({ type: "FeatureCollection", features });
});

// ------------------ Routes ------------------
app.get("/api/routes", (_, res) => {
  const features = GTFS.routes.map((r) => {
    const shape = GTFS.shapesById.get(r.route_id);
    let coords = [];
    if (shape?.length) {
      coords = shape.map((pt) => [pt.lon, pt.lat]);
    } else {
      const trip = GTFS.trips.find((t) => t.route_id === r.route_id);
      if (trip) {
        const st = GTFS.stopTimes
          .filter((x) => x.trip_id === trip.trip_id)
          .sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));
        coords = st.map((s) => {
          const sp = GTFS.stopsById.get(s.stop_id);
          return [Number(sp.stop_lon), Number(sp.stop_lat)];
        });
      }
    }
    return {
      type: "Feature",
      properties: {
        route_id: r.route_id,
        route_long_name: r.route_long_name,
        route_short_name: r.route_short_name,
      },
      geometry: { type: "LineString", coordinates: coords },
    };
  });
  res.json({ type: "FeatureCollection", features });
});

// ------------------ Route Schedule ------------------
app.get("/api/routes/:routeId/schedule", (req, res) => {
  const { routeId } = req.params;

  const trips = GTFS.trips.filter((t) => t.route_id === routeId);
  if (!trips.length)
    return res.status(404).json({ error: "No trips found for this route" });

  const schedules = [];
  for (const trip of trips) {
    const stopTimes = GTFS.stopTimes
      .filter((st) => st.trip_id === trip.trip_id)
      .sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));

    const stops = stopTimes.map((st) => {
      const stop = GTFS.stopsById.get(st.stop_id);
      return {
        stop_id: st.stop_id,
        name: stop?.stop_name || "Unknown",
        arrival: st.arrival_time,
        departure: st.departure_time,
        sequence: Number(st.stop_sequence),
      };
    });

    schedules.push({ trip_id: trip.trip_id, stops });
  }

  res.json({ route_id: routeId, schedules });
});

// ------------------ Live SSE ------------------
app.get("/api/live", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify({ msg: "connected" })}\n\n`);
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

// Broadcast
function broadcastBus(bus) {
  const payload = { event: "bus_update", data: bus };
  for (const c of sseClients) {
    try {
      c.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {}
  }
  io.emit("bus_update", bus); // via Socket.IO
}

// ------------------ Telemetry (HTTP POST) ------------------
app.post("/api/telemetry", (req, res) => {
  const { vehicleId, routeId, lat, lon, speedKmph, ts } = req.body || {};
  if (!vehicleId || typeof lat !== "number" || typeof lon !== "number")
    return res.status(400).json({ error: "vehicleId, lat, lon required" });

  const now = Date.now();
  const bus = {
    bus_id: vehicleId,
    route_id: routeId || null,
    lat,
    lon,
    speedKmph: Number(speedKmph || 0),
    ts: ts || now,
  };
  buses.set(vehicleId, bus);
  broadcastBus(bus);
  res.json({ ok: true });
});

// ------------------ WebSocket Telemetry (Driver) ------------------
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("telemetry", (bus) => {
    if (!bus.bus_id || typeof bus.lat !== "number" || typeof bus.lon !== "number")
      return;
    const now = Date.now();
    bus.ts = bus.ts || now;
    buses.set(bus.bus_id, bus);
    broadcastBus(bus);
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

// ------------------ Vehicles for Route ------------------
app.get("/api/routes/:routeId/vehicles", (req, res) => {
  const { routeId } = req.params;
  const vehicles = [];

  for (const bus of buses.values()) {
    if (bus.route_id === routeId) {
      vehicles.push(bus);
    }
  }

  res.json({ route_id: routeId, vehicles });
});

// Twilio routes
mountTwilioRoutes(app, { GTFS, buses });

// Start
const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(`🚍 RaahiTrack backend running on :${PORT}`)
);

// simulator.js - Simple simulator that posts telemetry to /api/telemetry by reading shapes
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GTFS = path.join(__dirname, "data", "gtfs");

function readCSV(name) {
  const txt = fs.readFileSync(path.join(GTFS, name), "utf8");
  return parse(txt, { columns: true, skip_empty_lines: true });
}

// parse shapes.txt
const shapes = readCSV("shapes.txt");
const shapesById = new Map();
shapes.forEach((s) => {
  const list = shapesById.get(s.shape_id) || [];
  list.push({
    lat: Number(s.shape_pt_lat),
    lon: Number(s.shape_pt_lon),
    seq: Number(s.shape_pt_sequence),
  });
  shapesById.set(s.shape_id, list);
});
for (const [k, l] of shapesById) l.sort((a, b) => a.seq - b.seq);

// select a subset (first 20 or fewer)
const routeIds = Array.from(shapesById.keys()).slice(0, 20);
const vehicles = [];
routeIds.forEach((routeId) => {
  const shape = shapesById.get(routeId);
  if (!shape) return;
  // one vehicle per route for simulation
  vehicles.push({ vehicleId: `${routeId}_V1`, routeId, idx: 0, shape });
});

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.BACKEND ||
  "http://localhost:8080";

async function postTelemetry(v) {
  try {
    const p = v.shape[v.idx];
    const speed = 20 + Math.floor(Math.random() * 15);

    // Node 18+ has global fetch
    await fetch(`${BACKEND}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: v.vehicleId,
        routeId: v.routeId,
        lat: p.lat,
        lon: p.lon,
        speedKmph: speed,
      }),
    }).catch(() => {});
    v.idx = (v.idx + 1) % v.shape.length;
  } catch (e) {
    console.error("postTelemetry error", e?.message || e);
  }
}

async function loop() {
  while (true) {
    for (const v of vehicles) await postTelemetry(v);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

loop().catch((err) => console.error("simulator error", err));

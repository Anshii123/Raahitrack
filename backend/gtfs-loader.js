// Load GTFS static CSV files into memory (ESM version)
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

function readCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

export function loadGTFS(gtfsFolder) {
  const stops = readCSV(path.join(gtfsFolder, "stops.txt"));
  const routes = readCSV(path.join(gtfsFolder, "routes.txt"));
  const trips = readCSV(path.join(gtfsFolder, "trips.txt"));
  const stopTimes = readCSV(path.join(gtfsFolder, "stop_times.txt"));
  const shapes = readCSV(path.join(gtfsFolder, "shapes.txt"));
  const calendar = readCSV(path.join(gtfsFolder, "calendar.txt"));

  const stopsById = new Map(stops.map((s) => [s.stop_id, s]));
  const tripsById = new Map(trips.map((t) => [t.trip_id, t]));
  const routesById = new Map(routes.map((r) => [r.route_id, r]));

  // group stopTimes by trip_id
  const stopTimesByTrip = new Map();
  stopTimes.forEach((st) => {
    const list = stopTimesByTrip.get(st.trip_id) || [];
    list.push(st);
    stopTimesByTrip.set(st.trip_id, list);
  });

  // group shapes by shape_id and sort by sequence
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
  for (const [k, list] of shapesById) list.sort((a, b) => a.seq - b.seq);

  return {
    stops,
    routes,
    trips,
    stopTimes,
    shapes,
    calendar,
    stopsById,
    tripsById,
    routesById,
    stopTimesByTrip,
    shapesById,
  };
}

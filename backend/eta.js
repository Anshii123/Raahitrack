// eta.js – Simple spatial helpers + ETA calculator (haversine)

function toRad(d) {
  return d * Math.PI / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestIndexOnLine(line, lat, lon) {
  let bestIdx = 0,
    bestD = Infinity;
  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    const d = haversineKm(lat, lon, p.lat, p.lon);
    if (d < bestD) {
      bestD = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function distanceAlong(line, fromIdx, toIdx) {
  if (toIdx <= fromIdx) return 0;
  let d = 0;
  for (let i = fromIdx; i < toIdx; i++) {
    d += haversineKm(line[i].lat, line[i].lon, line[i + 1].lat, line[i + 1].lon);
  }
  return d;
}

export function estimateETAMinutes(bus, stop, shapeLine, opts = {}) {
  const defaultSpeed = opts.defaultSpeedKmph || 18;
  const busIdx = nearestIndexOnLine(shapeLine, bus.lat, bus.lon);
  const stopIdx = nearestIndexOnLine(
    shapeLine,
    Number(stop.stop_lat),
    Number(stop.stop_lon)
  );
  const distKm = distanceAlong(shapeLine, busIdx, stopIdx);
  const speed = Math.max(Number(bus.speedKmph) || defaultSpeed, 5);
  const etaMin = (distKm / speed) * 60;
  return Math.max(0, Math.round(etaMin));
}

// export helpers too, in case needed
export { haversineKm, nearestIndexOnLine, distanceAlong };

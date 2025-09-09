// MapView.js
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { getRoutes, getStops, subscribeLiveBuses } from "../lib/routeApi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Bus + Stop icons
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [28, 28],
});
const stopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [20, 20],
});

// Auto-zoom to fit selected route
function ZoomToRoute({ route }) {
  const map = useMap();
  useEffect(() => {
    if (route?.geometry?.coordinates?.length) {
      const bounds = route.geometry.coordinates.map((c) => [c[1], c[0]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
}

export default function MapView({
  selectedRoute,
  height = "100%",
  width = "100%",
  busPosition = null, // simulated bus location
  routePath = [],     // simulated route polyline
}) {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [liveBuses, setLiveBuses] = useState({});

  // fetch routes, stops + subscribe to live buses
  useEffect(() => {
    getRoutes().then((d) => setRoutes(d?.features || []));
    getStops().then((d) => setStops(d?.features || []));

    const unsubscribe = subscribeLiveBuses((msg) => {
      if (msg.event === "bus_update") {
        setLiveBuses((prev) => ({
          ...prev,
          [msg.data.bus_id]: msg.data,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const visibleRoutes = selectedRoute
    ? routes.filter((r) => r.properties.route_id === selectedRoute.properties.route_id)
    : routes;

  // ✅ Fix: only filter stops if backend provides route_id
  const visibleStops = selectedRoute
    ? stops.filter((s) =>
        s.properties.route_id
          ? s.properties.route_id === selectedRoute.properties.route_id
          : true // fallback → show all stops if no route_id
      )
    : stops;

  const displayedBuses = Object.values(liveBuses || {});

  const defaultCenter = selectedRoute?.geometry?.coordinates?.length
    ? [selectedRoute.geometry.coordinates[0][1], selectedRoute.geometry.coordinates[0][0]]
    : [28.61, 77.20];

  return (
    <MapContainer center={defaultCenter} zoom={12} style={{ height, width }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <ZoomToRoute route={selectedRoute} />

      {/* Routes */}
      {visibleRoutes.map((r) => (
        <Polyline
          key={r.properties.route_id}
          positions={r.geometry.coordinates.map((c) => [c[1], c[0]])}
          color={
            selectedRoute?.properties.route_id === r.properties.route_id
              ? "#2563EB"
              : "#9CA3AF"
          }
          weight={4}
        />
      ))}

      {/* Stops */}
      {visibleStops.map((s) => (
        <Marker
          key={s.properties.stop_id}
          position={[s.geometry.coordinates[1], s.geometry.coordinates[0]]}
          icon={stopIcon}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>{s.properties.name}</strong>
              <br />
              <small className="text-gray-600">{s.properties.stop_id}</small>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Live buses */}
      {displayedBuses.map((b) =>
        b.lat && b.lon ? (
          <Marker key={b.bus_id} position={[b.lat, b.lon]} icon={busIcon}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div>
                  <strong>Bus {b.bus_id}</strong> · {b.route_id}
                </div>
                <div className="text-xs text-gray-600">
                  Last update: {new Date(b.ts).toLocaleTimeString()}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontWeight: 600, color: "#047857" }}>
                    ETA:{" "}
                    {b.eta_min !== null && b.eta_min !== undefined
                      ? `${b.eta_min} min`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

      {/* Simulated bus */}
      {busPosition && (
        <Marker position={busPosition} icon={busIcon}>
          <Popup>
            <strong>Simulated Bus 🚌</strong>
            <br />
            Live demo movement
          </Popup>
        </Marker>
      )}

      {/* Simulated polyline */}
      {routePath.length > 0 && (
        <Polyline positions={routePath} color="#10B981" weight={3} dashArray="4" />
      )}
    </MapContainer>
  );
}

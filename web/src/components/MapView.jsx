// MapView.jsx
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

// Custom icons
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [32, 32],
  className: "drop-shadow-lg",
});
const stopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [24, 24],
  className: "drop-shadow-md",
});

// Auto-zoom helper
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
  busPosition = null,
  routePath = [],
}) {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [liveBuses, setLiveBuses] = useState({});

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
    ? routes.filter(
        (r) => r.properties.route_id === selectedRoute.properties.route_id
      )
    : routes;

  const visibleStops = selectedRoute
    ? stops.filter((s) =>
        s.properties.route_id
          ? s.properties.route_id === selectedRoute.properties.route_id
          : true
      )
    : stops;

  const displayedBuses = Object.values(liveBuses || {});

  const defaultCenter = selectedRoute?.geometry?.coordinates?.length
    ? [selectedRoute.geometry.coordinates[0][1], selectedRoute.geometry.coordinates[0][0]]
    : [28.61, 77.20];

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer center={defaultCenter} zoom={12} style={{ height, width }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://hot.openstreetmap.org/">HOT</a>'
        />
        <ZoomToRoute route={selectedRoute} />

        {/* Routes */}
        {visibleRoutes.map((r) => (
          <Polyline
            key={r.properties.route_id}
            positions={r.geometry.coordinates.map((c) => [c[1], c[0]])}
            color={
              selectedRoute?.properties.route_id === r.properties.route_id
                ? "#4F46E5" // indigo-600
                : "#9CA3AF" // gray-400
            }
            weight={5}
            opacity={0.8}
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
              <div className="p-2">
                <p className="font-semibold text-indigo-700">
                  {s.properties.name}
                </p>
                <p className="text-xs text-gray-500">
                  Stop ID: {s.properties.stop_id}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live buses */}
        {displayedBuses.map(
          (b) =>
            b.lat &&
            b.lon && (
              <Marker key={b.bus_id} position={[b.lat, b.lon]} icon={busIcon}>
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-green-700">
                      🚌 Bus {b.bus_id}
                    </p>
                    <p className="text-sm text-gray-600">{b.route_id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last update:{" "}
                      {new Date(b.ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 text-green-600 font-semibold">
                      ETA:{" "}
                      {b.eta_min !== null && b.eta_min !== undefined
                        ? `${b.eta_min} min`
                        : "N/A"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
        )}

        {/* Simulated bus */}
        {busPosition && (
          <Marker position={busPosition} icon={busIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-bold text-indigo-700">Simulated Bus</p>
                <p className="text-sm text-gray-600">
                  Demo live movement 🟢
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Simulated polyline */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="#10B981" // emerald-500
            weight={4}
            dashArray="6"
          />
        )}
      </MapContainer>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import TimelineView from "./TimelineView";
import MapView from "./MapView";
import { getRoutes, subscribeLiveBuses } from "../lib/routeApi";

export default function UserView({ onLogout }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [busPosition, setBusPosition] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  // ✅ Fetch available routes
  useEffect(() => {
    getRoutes().then((d) => {
      const fetched = d?.features || [];
      setRoutes(fetched);
    });
  }, []);

  // ✅ Set path when route is selected
  useEffect(() => {
    if (!selectedRoute || !selectedRoute.geometry) return;

    const path = selectedRoute.geometry.coordinates.map((c) => [c[1], c[0]]);
    setRoutePath(path);
    setBusPosition(null); // reset when new route selected
  }, [selectedRoute]);

  // ✅ Subscribe to live bus updates (SSE)
  useEffect(() => {
    const unsubscribe = subscribeLiveBuses((msg) => {
      if (msg.event === "bus_update") {
        const bus = msg.data;
        // only update if bus belongs to selected route
        if (
          selectedRoute &&
          bus.route_id === selectedRoute.properties.route_id
        ) {
          setBusPosition([bus.lat, bus.lon]);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedRoute]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-green-700 text-white p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-6">User Dashboard</h2>

        {routes.length === 0 ? (
          <p className="text-sm text-gray-300">Loading routes...</p>
        ) : (
          <ul>
            {routes.map((r) => (
              <li
                key={r.properties.route_id}
                className={`cursor-pointer p-2 rounded-md mb-2 ${
                  selectedRoute?.properties?.route_id ===
                  r.properties.route_id
                    ? "bg-green-500"
                    : "hover:bg-green-600"
                }`}
                onClick={() => setSelectedRoute(r)}
              >
                {r.properties.route_long_name ||
                  `Route ${r.properties.route_id}`}
              </li>
            ))}
          </ul>
        )}

        <button
          className="mt-6 bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content (Timeline + Map) */}
      <div className="flex-1 flex flex-col">
        {/* Top: Timeline */}
        <div className="h-1/3 border-b">
          <TimelineView selectedRoute={selectedRoute} />
        </div>

        {/* Bottom: Map with live bus */}
        <div className="flex-1">
          <MapView
            selectedRoute={selectedRoute}
            busPosition={busPosition}
            routePath={routePath}
          />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import TimelineView from "./TimelineView";
import MapView from "./MapView";
import { getRoutes, subscribeLiveBuses } from "../lib/routeApi";

export default function UserView({ onLogout }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [busPosition, setBusPosition] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    getRoutes().then((d) => {
      const fetched = d?.features || [];
      setRoutes(fetched);
    });
  }, []);

  useEffect(() => {
    if (!selectedRoute || !selectedRoute.geometry) return;
    const path = selectedRoute.geometry.coordinates.map((c) => [c[1], c[0]]);
    setRoutePath(path);
    setBusPosition(null);
  }, [selectedRoute]);

  useEffect(() => {
    const unsubscribe = subscribeLiveBuses((msg) => {
      if (msg.event === "bus_update") {
        const bus = msg.data;
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
      <div className="w-1/4 bg-green-700 text-white p-6 flex flex-col">
        <h2 className="text-lg font-bold mb-6">User Dashboard</h2>

        <select
          className="p-3 rounded-lg text-black"
          value={selectedRoute?.properties?.route_id || ""}
          onChange={(e) =>
            setSelectedRoute(routes.find((r) => r.properties.route_id === e.target.value))
          }
        >
          <option value="">Select Route</option>
          {routes.map((r) => (
            <option key={r.properties.route_id} value={r.properties.route_id}>
              {r.properties.route_long_name || `Route ${r.properties.route_id}`}
            </option>
          ))}
        </select>

        <button
          className="mt-6 bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Pipeline style timeline */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <TimelineView selectedRoute={selectedRoute} pipeline />
        </div>

        {/* Small Map */}
        <div className="w-1/3 border-l shadow-lg">
          <MapView
            selectedRoute={selectedRoute}
            busPosition={busPosition}
            routePath={routePath}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}

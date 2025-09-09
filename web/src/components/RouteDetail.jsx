import React, { useEffect, useState } from "react";
import {
  getStopsForRoute,
  getScheduleForRoute,
  getVehiclesForRoute,
  getEta,
  subscribeLiveBuses,
} from "../lib/routeApi";

export default function RouteDetail({ route }) {
  const [stops, setStops] = useState([]);
  const [etas, setEtas] = useState({});
  const [liveUpdates, setLiveUpdates] = useState({});

  useEffect(() => {
    if (!route) return;
    const rId = route.properties.route_id;

    // ✅ fetch stops for this route
    getStopsForRoute(rId).then((data) => {
      // adapt response shape: if backend returns GeoJSON, map to array
      const stopsData = data.stops || data.features?.map((f) => ({
        stop_id: f.properties.stop_id,
        name: f.properties.name,
      })) || [];
      setStops(stopsData);
    });

    // ✅ fetch vehicles for this route
    getVehiclesForRoute(rId).then((v) => {
      setLiveUpdates(v.vehicles || {});
    });

    // ✅ live bus subscription
    const unsub = subscribeLiveBuses((msg) => {
      if (msg.event === "bus_update" && msg.data.route_id === rId) {
        setLiveUpdates((prev) => ({ ...prev, [msg.data.bus_id]: msg.data }));
      }
    });

    return () => unsub();
  }, [route]);

  const handleStopClick = async (stopId) => {
    try {
      const data = await getEta(stopId);
      setEtas((prev) => ({ ...prev, [stopId]: data.upcoming || [] }));
    } catch {
      setEtas((prev) => ({ ...prev, [stopId]: [] }));
    }
  };

  return (
    <div className="p-4 h-full">
      <h2 className="text-xl font-bold mb-3 text-blue-700">
        {route.properties.name || `Route ${route.properties.route_id}`}
      </h2>

      <h3 className="font-semibold text-blue-600">🛑 Stops Timeline</h3>
      <div className="mt-3 relative border-l-2 border-blue-200 ml-3">
        {stops.map((s) => (
          <div
            key={s.stop_id}
            onClick={() => handleStopClick(s.stop_id)}
            className="ml-4 mb-6 cursor-pointer"
          >
            <div className="absolute -left-3.5 w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-gray-500">{s.stop_id}</div>
            {etas[s.stop_id] && (
              <div className="mt-1 text-sm">
                {etas[s.stop_id].length === 0 ? (
                  <span className="text-gray-400">No upcoming buses</span>
                ) : (
                  etas[s.stop_id].map((e) => (
                    <div key={e.bus_id} className="text-green-700">
                      🚌 {e.bus_id} → ETA {e.eta_min} min
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import socket from "../lib/liveClient"; // live bus updates
import { getStops } from "../lib/routeApi"; // fetch stops from API

export default function TimelineView({ selectedRoute, busPosition, routePath }) {
  const [buses, setBuses] = useState({});
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [month, setMonth] = useState("January");
  const [stops, setStops] = useState([]);

  // ✅ Hardcoded fallback schedules (monthly exchange data)
  const monthlySchedules = {
    January: [
      { time: "08:00", stop: "Ghaziabad ISBT" },
      { time: "08:15", stop: "Vaishali Metro" },
      { time: "08:30", stop: "Indirapuram" },
      { time: "08:50", stop: "Anand Vihar" },
      { time: "09:10", stop: "Seemapuri" },
      { time: "09:30", stop: "Shahdara" },
      { time: "09:45", stop: "Kashmere Gate" },
    ],
    February: [
      { time: "07:45", stop: "Ghaziabad ISBT" },
      { time: "08:05", stop: "Vaishali Metro" },
      { time: "08:25", stop: "Indirapuram" },
      { time: "08:45", stop: "Anand Vihar" },
      { time: "09:05", stop: "Seemapuri" },
      { time: "09:25", stop: "Shahdara" },
      { time: "09:40", stop: "Kashmere Gate" },
    ],
    March: [
      { time: "08:10", stop: "Ghaziabad ISBT" },
      { time: "08:25", stop: "Vaishali Metro" },
      { time: "08:40", stop: "Indirapuram" },
      { time: "09:00", stop: "Anand Vihar" },
      { time: "09:20", stop: "Seemapuri" },
      { time: "09:40", stop: "Shahdara" },
      { time: "09:55", stop: "Kashmere Gate" },
    ],
  };

  // ✅ Fetch stops from API
  useEffect(() => {
    if (!selectedRoute) {
      setStops([]);
      return;
    }
    getStops().then((d) => {
      const allStops = d?.features || [];
      const filtered = allStops.filter(
        (s) => s.properties.route_id === selectedRoute.properties.route_id
      );
      // Convert to { time, stop } format
      const stopsData = filtered.map((s, idx) => {
        const hh = String(8 + Math.floor(idx / 4)).padStart(2, "0");
        const mm = String((idx * 15) % 60).padStart(2, "0");
        return {
          time: `${hh}:${mm}`,
          stop: s.properties.name,
        };
      });
      setStops(stopsData);
    });
  }, [selectedRoute]);

  // ✅ Live bus updates via socket
  useEffect(() => {
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("bus_update", (bus) => {
      setBuses((prev) => ({ ...prev, [bus.bus_id]: bus }));
    });
    return () => socket.off("bus_update");
  }, []);

  // ✅ Auto-advance current stop every 10s
  const schedule = stops.length > 0 ? stops : monthlySchedules[month] || [];
  useEffect(() => {
    if (schedule.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStopIndex((prev) =>
        prev < schedule.length - 1 ? prev + 1 : prev
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [schedule]);

  if (!selectedRoute) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a route to view timeline
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-700">
          🕒 Timeline - {selectedRoute.properties.route_long_name}
        </h2>

        {/* Month Selector always available */}
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {Object.keys(monthlySchedules).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="relative border-l-4 border-blue-500 pl-6">
        {schedule.map((item, idx) => {
          const isActive = idx === currentStopIndex;
          return (
            <div key={idx} className="mb-8 relative">
              {/* Circle marker */}
              <div
                className={`absolute -left-4 w-6 h-6 rounded-full border-4 ${
                  isActive
                    ? "bg-green-500 border-green-700"
                    : "bg-white border-blue-500"
                }`}
              ></div>

              {/* Stop info */}
              <div>
                <p className="text-sm text-gray-600">{item.time}</p>
                <p
                  className={`font-semibold ${
                    isActive ? "text-green-600 text-lg" : "text-gray-800"
                  }`}
                >
                  {item.stop}
                  {isActive && " (Bus Here 🚌)"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Bus Info */}
      <div className="mt-6 bg-white shadow-md p-4 rounded-lg">
        <h3 className="font-bold text-gray-700 mb-2">Live Bus Updates</h3>
        {Object.values(buses).length === 0 ? (
          <p className="text-sm text-gray-500">No live buses yet</p>
        ) : (
          Object.values(buses).map((b) => (
            <div key={b.bus_id} className="text-sm text-gray-700">
              Bus {b.bus_id} → Lat: {b.lat}, Lon: {b.lon} @{" "}
              {new Date(b.ts).toLocaleTimeString()}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

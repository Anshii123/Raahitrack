// TimelineView.jsx
import React, { useEffect, useState } from "react";
import socket from "../lib/liveClient"; // live bus updates
import { getStops } from "../lib/routeApi"; // fetch stops from API

export default function TimelineView({ selectedRoute, busPosition, routePath }) {
  const [buses, setBuses] = useState({});
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [month, setMonth] = useState("January");
  const [stops, setStops] = useState([]);

  // ✅ Hardcoded fallback schedules
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

  // ✅ Live bus updates
  useEffect(() => {
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("bus_update", (bus) => {
      setBuses((prev) => ({ ...prev, [bus.bus_id]: bus }));
    });
    return () => socket.off("bus_update");
  }, []);

  // ✅ Auto-advance
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          🕒 {selectedRoute.properties.route_long_name} Timeline
        </h2>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {Object.keys(monthlySchedules).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline Pipeline */}
      <div className="relative border-l-8 border-indigo-500 pl-8">
        {schedule.map((item, idx) => {
          const isActive = idx === currentStopIndex;
          return (
            <div
              key={idx}
              className="mb-10 relative transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Circle marker */}
              <div
                className={`absolute -left-5 w-8 h-8 rounded-full border-4 shadow-lg ${
                  isActive
                    ? "bg-green-500 border-green-700 animate-pulse"
                    : "bg-white border-indigo-500"
                }`}
              ></div>

              {/* Stop info card */}
              <div
                className={`p-4 rounded-xl shadow-md ${
                  isActive ? "bg-green-50 border border-green-400" : "bg-white"
                }`}
              >
                <p className="text-sm text-gray-500">{item.time}</p>
                <p
                  className={`font-semibold ${
                    isActive ? "text-green-700 text-lg" : "text-gray-800"
                  }`}
                >
                  {item.stop}
                  {isActive && " 🚌 (Bus Here)"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Bus Info */}
      <div className="mt-8 bg-white shadow-lg p-6 rounded-2xl border border-gray-100">
        <h3 className="font-bold text-indigo-700 mb-3">Live Bus Updates</h3>
        {Object.values(buses).length === 0 ? (
          <p className="text-sm text-gray-500">No live buses yet</p>
        ) : (
          Object.values(buses).map((b) => (
            <div
              key={b.bus_id}
              className="text-sm text-gray-700 bg-gray-50 rounded-md p-2 mb-2"
            >
              🚍 Bus <span className="font-bold">{b.bus_id}</span> → Lat:{" "}
              {b.lat}, Lon: {b.lon} @{" "}
              {new Date(b.ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

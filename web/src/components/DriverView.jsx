import React, { useState, useEffect } from "react";

export default function DriverView({ onLogout }) {
  const [currentLocation, setCurrentLocation] = useState([28.6692, 77.4538]);
  const vehicleId = "bus-101"; 
  const routeId = "route-1";   

  useEffect(() => {
    const sendTelemetry = async (lat, lon) => {
      try {
        await fetch("http://localhost:8080/api/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleId,
            routeId,
            lat,
            lon,
            speedKmph: 0,
            ts: Date.now(),
          }),
        });
      } catch (err) {
        console.error("❌ Telemetry push failed:", err);
      }
    };

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = [pos.coords.latitude, pos.coords.longitude];
          setCurrentLocation(newLoc);
          sendTelemetry(newLoc[0], newLoc[1]);
        },
        (err) => console.error("⚠️ Error getting location:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    const interval = setInterval(() => {
      setCurrentLocation((prev) => {
        const newLoc = [
          prev[0] + (Math.random() - 0.5) * 0.001,
          prev[1] + (Math.random() - 0.5) * 0.001,
        ];
        sendTelemetry(newLoc[0], newLoc[1]);
        return newLoc;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-yellow-600 text-white p-6">
        <h2 className="text-lg font-bold mb-6">Driver Dashboard</h2>
        <p className="mb-4">Your location is updating automatically 🚍📡</p>

        <button
          className="mt-6 bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Current Location</h2>
          <p>Lat: {currentLocation[0]?.toFixed(6)}</p>
          <p>Lng: {currentLocation[1]?.toFixed(6)}</p>
        </div>
      </div>
    </div>
  );
}

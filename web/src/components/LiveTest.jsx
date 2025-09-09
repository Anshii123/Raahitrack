import React, { useEffect, useState } from "react";
import socket from "../lib/liveClient";

export default function LiveTest() {
  const [buses, setBuses] = useState({});

  useEffect(() => {
    socket.on("connect", () => console.log("socket connected", socket.id));
    socket.on("bus_update", (bus) => {
      setBuses((prev) => ({ ...prev, [bus.bus_id]: bus }));
    });
    return () => {
      socket.off("bus_update");
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-2">Live Bus Feed</h2>
      {Object.values(buses).map((b) => (
        <div key={b.bus_id}>
          🚌 {b.bus_id} @ {b.lat.toFixed(4)},{b.lon.toFixed(4)}
        </div>
      ))}
    </div>
  );
}

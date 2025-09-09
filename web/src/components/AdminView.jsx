import React, { useState, useEffect } from "react";
import TimelineView from "./TimelineView";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function AdminView({ onLogout }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [busPosition, setBusPosition] = useState([28.6692, 77.4538]); // starting Ghaziabad
  const [routePath, setRoutePath] = useState([]);

  // Dummy routes
  const dummyRoutes = [
    {
      id: 1,
      properties: { route_long_name: "Ghaziabad → Kashmere Gate" },
      path: [
        [28.6692, 77.4538], // Ghaziabad ISBT
        [28.6435, 77.3424], // Vaishali
        [28.6400, 77.3300], // Indirapuram
        [28.6460, 77.3150], // Anand Vihar
        [28.6780, 77.3010], // Seemapuri
        [28.6750, 77.2830], // Shahdara
        [28.6670, 77.2274], // Kashmere Gate
      ],
    },
    {
      id: 2,
      properties: { route_long_name: "Vaishali → Connaught Place" },
      path: [
        [28.6435, 77.3424], // Vaishali
        [28.6289, 77.2182], // CP
      ],
    },
  ];

  // Fake bus movement simulation
  useEffect(() => {
    if (!selectedRoute) return;

    setRoutePath(selectedRoute.path);
    let i = 0;
    setBusPosition(selectedRoute.path[0]);

    const interval = setInterval(() => {
      setBusPosition(selectedRoute.path[i]);
      if (i < selectedRoute.path.length - 1) {
        i++;
      } else {
        clearInterval(interval);
      }
    }, 4000); // move every 4 sec

    return () => clearInterval(interval);
  }, [selectedRoute]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-blue-700 text-white p-6">
        <h2 className="text-lg font-bold mb-6">Admin Dashboard</h2>
        <ul>
          {dummyRoutes.map((r) => (
            <li
              key={r.id}
              className={`cursor-pointer p-2 rounded-md mb-2 ${
                selectedRoute?.id === r.id ? "bg-blue-500" : "hover:bg-blue-600"
              }`}
              onClick={() => setSelectedRoute(r)}
            >
              {r.properties.route_long_name}
            </li>
          ))}
        </ul>
        <button
          className="mt-6 bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* Timeline + Map Section */}
      <div className="flex-1 flex">
        {/* Timeline Section */}
        <div className="w-2/3 border-r">
          <TimelineView
            selectedRoute={selectedRoute}
            busPosition={busPosition}
            routePath={routePath}
          />
        </div>

        {/* Map Section */}
        <div className="w-1/3 p-4">
          {selectedRoute ? (
            <MapContainer
              center={busPosition}
              zoom={13}
              style={{ height: "100%", borderRadius: "12px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={routePath} color="blue" />
              <Marker position={busPosition}>
                <Popup>🚍 Bus is here</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a route to view map
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

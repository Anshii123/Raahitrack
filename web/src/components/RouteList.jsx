import React from "react";

export default function RouteList({ routesGeo, selectedRouteId, onSelectRoute }) {
  const features = routesGeo?.features ?? [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-blue-600">Available Routes</h3>
      <div className="space-y-3">
        {features.length === 0 && (
          <p className="text-gray-500 text-sm">No routes loaded.</p>
        )}

        {features.map((f) => {
          const id = f.properties.route_id;
          const name = f.properties.name || f.properties.route_long_name || f.properties.route_short_name || id;
          const isActive = selectedRouteId === id;

          return (
            <button
              key={id}
              onClick={() => onSelectRoute(id)}
              className={`w-full text-left p-3 rounded-lg border transition flex flex-col gap-1 ${
                isActive ? "bg-blue-600 text-white shadow-md" : "bg-white hover:bg-blue-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{name}</div>
                <div className="text-xs opacity-70">{id}</div>
              </div>
              <div className="text-xs text-gray-500">
                {f.properties.route_desc || "Click to view live buses & stops"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// App.jsx
import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import RouteDetail from "./components/RouteDetail";
import RouteList from "./components/RouteList";
import { getRoutes } from "./lib/routeApi";
import LiveTest from "./components/LiveTest";
import TimelineView from "./components/TimelineView";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import AdminView from "./components/AdminView";
import UserView from "./components/UserView";
import DriverView from "./components/DriverView"; // ✅ NEW

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedRouteObj, setSelectedRouteObj] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);

  // Auth state
  const [role, setRole] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  // Fetch routes
  useEffect(() => {
    getRoutes()
      .then((data) => {
        const features = data?.features || [];
        setRoutes(features);
      })
      .catch(() => setRoutes([]));
  }, []);

  // Sync route object
  useEffect(() => {
    if (!selectedRouteId) {
      setSelectedRouteObj(null);
      return;
    }
    const r = routes.find((x) => x.properties.route_id === selectedRouteId);
    setSelectedRouteObj(r || null);
  }, [selectedRouteId, routes]);

  // =====================
  // Auth flow
  // =====================
  if (!role) {
    if (showSignup) {
      return <SignUpPage onSignUp={() => setShowSignup(false)} />;
    }
    return (
      <LoginPage
        onLogin={(r) => setRole(r)}
        goToSignUp={() => setShowSignup(true)}
      />
    );
  }

  // Admin View → driver location sender
  if (role === "admin") {
    return <AdminView onLogout={() => setRole(null)} />;
  }

  // Driver View → sends live location
  if (role === "driver") {
    return <DriverView onLogout={() => setRole(null)} />;
  }

  // User View → routes + map + live bus
  if (role === "user") {
    return (
      <UserView onLogout={() => setRole(null)}>
        <div className="flex h-screen" style={{ minWidth: 900 }}>
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-50 p-4 overflow-y-auto border-r shadow-md">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <span style={{ fontSize: 26 }}>🚍</span> Raahitrack
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                A smart, low-bandwidth friendly real-time bus tracker for tier-2
                towns. Click a route to view live buses, stops & schedule.
              </p>
            </div>

            <RouteList
              routesGeo={{ features: routes }}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />

            <button
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              onClick={() => setShowTimeline(!showTimeline)}
            >
              {showTimeline ? "Show Map View" : "Show Timeline View"}
            </button>
          </div>

          {/* Middle Section */}
          <div className="flex-1 relative">
            {showTimeline ? (
              <TimelineView selectedRoute={selectedRouteObj} />
            ) : (
              <MapView selectedRoute={selectedRouteObj} />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-96 bg-white border-l shadow-lg overflow-y-auto">
            {selectedRouteObj ? (
              <>
                <RouteDetail route={selectedRouteObj} />
                <LiveTest />
              </>
            ) : (
              <div className="p-6">
                <h2 className="text-lg font-semibold">No route selected</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Select a route from the left to see stops, schedule and live
                  buses.
                </p>
              </div>
            )}
          </div>
        </div>
      </UserView>
    );
  }

  return null;
}

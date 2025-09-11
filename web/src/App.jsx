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
import DriverView from "./components/DriverView";

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedRouteObj, setSelectedRouteObj] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);

  // Auth state
  const [user, setUser] = useState(null);   // ✅ store full user
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
  if (!user) {
    const bgStyle = {
      backgroundImage:
        "url('https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
    if (showSignup) {
      return (
        <div className="flex items-center justify-center h-screen w-screen" style={bgStyle}>
          <SignUpPage onSignUp={() => setShowSignup(false)} />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-screen w-screen" style={bgStyle}>
        <LoginPage
          onLogin={(u) => {
            // ✅ Ensure a role is present, else fallback to "user"
            if (!u?.role) {
              u = { ...u, role: "user" };
            }
            setUser(u);
          }}
          goToSignUp={() => setShowSignup(true)}
        />
      </div>
    );
  }

  // =====================
  // Role Based Views
  // =====================
  if (user.role === "admin") {
    return <AdminView onLogout={() => setUser(null)} />;
  }

  if (user.role === "driver") {
    return <DriverView onLogout={() => setUser(null)} />;
  }

  if (user.role === "user") {
    return (
      <UserView onLogout={() => setUser(null)}>
        <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100">
          {/* Left Sidebar */}
          <div className="w-80 bg-white p-6 overflow-y-auto border-r shadow-lg">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-extrabold text-blue-700 flex items-center justify-center gap-2">
                <span className="text-4xl">🚍</span> Raahi<span className="text-yellow-600">Track</span>
              </h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Smart, low-bandwidth friendly real-time bus tracker for tier-2 towns.
              </p>
            </div>

            <RouteList
              routesGeo={{ features: routes }}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />

            <button
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 rounded-xl shadow-md transition"
              onClick={() => setShowTimeline(!showTimeline)}
            >
              {showTimeline ? "Show Map View" : "Show Timeline View"}
            </button>
          </div>

          {/* Map / Timeline Section */}
          <div className="flex-1 relative bg-gray-200">
            {showTimeline ? (
              <TimelineView selectedRoute={selectedRouteObj} />
            ) : (
              <MapView selectedRoute={selectedRouteObj} />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-96 bg-white border-l shadow-lg overflow-y-auto p-6">
            {selectedRouteObj ? (
              <>
                <RouteDetail route={selectedRouteObj} />
                <LiveTest />
              </>
            ) : (
              <div className="text-center mt-20">
                <h2 className="text-lg font-semibold text-gray-700">No route selected</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Select a route from the left to see stops, schedule and live buses.
                </p>
              </div>
            )}
          </div>
        </div>
      </UserView>
    );
  }

  // ✅ Fallback if role is not recognized
  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-700">
      <h2 className="text-xl font-bold">Unknown role</h2>
      <button
        onClick={() => setUser(null)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}

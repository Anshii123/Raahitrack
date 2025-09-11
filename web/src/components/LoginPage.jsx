import React, { useState } from "react";
import bgImage from "./background.jpg";
import logo from "./logo.jpg";

export default function LoginPage({ goToSignUp, onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("rt_users") || "[]");
    const found = users.find(
      (u) => u.phone === phone && u.password === password && u.role === role
    );

    if (!found) {
      alert("Invalid credentials or role mismatch");
      return;
    }

    alert(`Welcome back, ${found.name}!`);
    onLogin(found); // Pass the user info back (with role)
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-gray-50"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      {/* Blur Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

      {/* Centered Login Card */}
      <div className="relative z-10 bg-white p-12 rounded-3xl shadow-2xl max-w-lg w-full mx-6 text-center transform transition hover:scale-[1.02]">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={logo}
            alt="Logo"
            className="w-28 h-28 mb-4 rounded-full shadow-lg border-4 border-green-600"
          />
          <h1 className="text-4xl font-extrabold text-green-700 tracking-wide drop-shadow-md">
            RAAHITRACK
          </h1>
          <p className="text-gray-600 mt-2 text-lg font-medium">
            Smart Bus Tracking System
          </p>
        </div>

        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-400 transition text-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-400 transition text-lg"
            required
          />

          {/* Role selection */}
          <div className="flex justify-between items-center text-gray-700 font-semibold">
            <label htmlFor="role" className="select-none text-lg">
              Login as:
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-400 transition text-lg"
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-2xl text-xl font-semibold shadow-md hover:bg-green-700 hover:shadow-lg transition"
          >
            Login
          </button>
        </form>

        <p className="mt-10 text-gray-700 text-lg">
          New here?{" "}
          <button
            onClick={goToSignUp}
            className="text-green-600 font-semibold hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

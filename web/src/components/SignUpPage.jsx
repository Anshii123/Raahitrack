// SignUpPage.jsx
import React, { useState } from "react";

export default function SignUpPage({ onSignUp }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handle = (e) => {
    e.preventDefault();
    if (!name || !phone || !password) return alert("Fill all fields");

    const users = JSON.parse(localStorage.getItem("rt_users") || "[]");
    if (users.find((u) => u.phone === phone))
      return alert("User already exists");

    users.push({ name, phone, password, role });
    localStorage.setItem("rt_users", JSON.stringify(users));

    alert("Signed up! Please log in.");
    if (onSignUp) onSignUp();
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        {/* Branding */}
        <h1 className="text-3xl font-extrabold text-green-700 text-center mb-6">
          🚍 RAAHITRACK
        </h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Create Your Account
        </h2>

        {/* Signup Form */}
        <form onSubmit={handle} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Phone (unique)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Passenger</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>

          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-lg shadow-md transition">
            Sign Up
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-4 text-center text-sm text-gray-700">
          Already have an account?{" "}
          <button
            className="text-green-700 font-semibold hover:underline"
            onClick={() => onSignUp(true)}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

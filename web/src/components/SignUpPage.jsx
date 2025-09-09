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
    if (users.find((u) => u.phone === phone)) return alert("User already exists");

    users.push({ name, phone, password, role });
    localStorage.setItem("rt_users", JSON.stringify(users));
    alert("Signed up! Please log in.");
    if (onSignUp) onSignUp(); // Go back to login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-green-700 flex items-center justify-center gap-2 mb-6">
          🚍 RAAHITRACK
        </h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Create Your Account
        </h2>
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
            className="w-full border p-3 rounded-lg"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Passenger</option>
            <option value="admin">Driver / Admin</option>
          </select>

          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-lg">
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            className="text-green-600 underline"
            onClick={() => onSignUp(true)}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

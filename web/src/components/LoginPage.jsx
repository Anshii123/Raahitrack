// LoginPage.jsx
import React, { useState } from "react";

export default function LoginPage({ onLogin, goToSignUp }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handle = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("rt_users") || "[]");
    const user = users.find((u) => u.phone === phone && u.password === password);

    if (!user) return alert("Invalid credentials or user not signed up.");

    localStorage.setItem(
      "rt_session",
      JSON.stringify({ phone: user.phone, role: user.role, name: user.name })
    );
    onLogin && onLogin(user.role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 flex items-center justify-center gap-2 mb-6">
          🚍 RAAHITRACK
        </h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Welcome Back – Login to Continue
        </h2>
        <form onSubmit={handle} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-lg">
            Login
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          New here?{" "}
          <button className="text-blue-600 underline" onClick={goToSignUp}>
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

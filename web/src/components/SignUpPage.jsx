// SignUpPage.jsx
import React, { useState } from "react";
import bgImage from "./background.jpg";
import logo from "./logo.jpg";
import "../styles.css";

export default function SignUpPage({ onSignUp }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");   // ✅ FIXED missing password state
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSignUp = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("rt_users") || "[]");
    const existing = users.find((u) => u.phone === phone);

    if (existing) {
      alert("User already exists with this phone number");
      return;
    }

    const newUser = { name, phone, password, role };
    users.push(newUser);
    localStorage.setItem("rt_users", JSON.stringify(users));

    alert("Account created successfully! Please login.");
    onSignUp();   // ✅ fixed prop
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 flex bg-white/95 shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full mx-6">
        {/* Left Section */}
        <div className="hidden md:flex flex-col items-center justify-center bg-green-600 text-white w-1/2 p-10">
          <img src={logo} alt="Logo" className="w-28 h-28 mb-6 rounded-full border-4 border-white shadow-lg"/>
          <h1 className="text-4xl font-extrabold tracking-wide">RAAHITRACK</h1>
          <p className="mt-4 text-lg font-medium opacity-90">Smart Bus Tracking System</p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col justify-center w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create Account</h2>

          <form onSubmit={handleSignUp} className="space-y-6">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 text-lg"/>
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 text-lg"/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 text-lg"/>
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 text-lg"/>

            {/* Role */}
            <div className="flex justify-between items-center text-gray-700 font-medium">
              <label htmlFor="role" className="text-lg">Sign up as:</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="px-4 py-3 border rounded-lg focus:ring-4 focus:ring-green-400 text-lg">
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg text-xl font-semibold shadow-md hover:bg-green-700 transition">Sign Up</button>
          </form>

          <p className="mt-6 text-center text-gray-700 text-lg">
            Already have an account?{" "}
            <button onClick={onSignUp} className="text-green-600 font-semibold hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

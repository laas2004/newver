"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedId = employeeId.trim().toUpperCase();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: trimmedId,
          password: showPassword ? password : undefined,
        }),
      });

      const data = await res.json();

      // 👉 Step 1: Ask for password if needed
      if (data.needPassword) {
        setShowPassword(true);
        setLoading(false);
        return;
      }

      // 👉 Step 2: Handle login errors
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // 👉 Step 3: Store user data + redirect (YOUR LOGIC, CLEANED)
      if (data.redirect) {
        localStorage.setItem("userEmployeeId", trimmedId);
        if (data.role) {
          localStorage.setItem("userRole", data.role);
        }
        if (data.domain) {
          localStorage.setItem("userDomain", data.domain);
        }

        setLoading(false);

        // Redirect to target page
        window.location.href = data.redirect;
        return;
      }

      // Fallback (if no redirect returned)
      setError("Invalid server response");
      setLoading(false);
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PRAGYA</h1>
          <h2 className="text-3xl font-semibold text-gray-900">AI Assistant</h2>
          <p className="text-gray-600 mt-2">Enter your Employee ID</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g., ADMIN001, SME_HR001, USER001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          {showPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (Required for Admin/SME)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : showPassword ? "Login" : "Continue"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-gray-500">Demo Employee IDs:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs">
            <span className="bg-gray-100 px-2 py-1 rounded">ADMIN001</span>
            <span className="bg-gray-100 px-2 py-1 rounded">SME_HR001</span>
            <span className="bg-gray-100 px-2 py-1 rounded">SME_CIT001</span>
            <span className="bg-gray-100 px-2 py-1 rounded">SME_COM001</span>
            <span className="bg-gray-100 px-2 py-1 rounded">USER001</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Note: Only Admin and SME need passwords (admin123 / sme123)
          </p>
        </div>
      </div>
    </div>
  );
}
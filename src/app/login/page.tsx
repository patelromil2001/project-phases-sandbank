"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Ensure this path is correct for your AuthContext

interface FormData {
  email: string;
  password: string;
}

function validatePassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}

export default function LoginPage() {
  const [form, setForm] = useState<FormData>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth(); // Assuming refreshAuth is provided by your AuthContext

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccess(message);
      // Clean up the URL after displaying the message
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("message");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]); // searchParams is a stable object, so it won't cause infinite re-renders

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for sending cookies (e.g., session tokens)
        body: JSON.stringify({
          email: form.email.toLowerCase().trim(),
          password: form.password,
        }),
      });

      if (res.ok) {
        await refreshAuth(); // Call to refresh authentication state
        // Optionally, redirect to a 'redirect' query param if it exists
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.push(redirectTo);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials.");
      }
    } catch (error: unknown) {
      // Safely check the type of error
      const message =
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error message when user starts typing again
    if (error) {
      setError("");
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!resetEmail || !resetNewPassword || !resetConfirm) {
      setResetError("All fields are required for password reset.");
      return;
    }
    if (resetNewPassword !== resetConfirm) {
      setResetError("New passwords do not match.");
      return;
    }
    if (!validatePassword(resetNewPassword)) {
      setResetError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and a special character."
      );
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: resetEmail.toLowerCase().trim(), // Ensure email is trimmed and lowercased
          newPassword: resetNewPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetSuccess("Password reset successfully! You can now log in with your new password.");
        // Clear fields and close modal after a short delay
        setResetEmail("");
        setResetNewPassword("");
        setResetConfirm("");
        setTimeout(() => {
          setShowReset(false);
        }, 2000); // Close modal after 2 seconds
      } else {
        setResetError(data.error || "Failed to reset password.");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Network error during password reset. Please try again.";
      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center">
              <span className="text-yellow-900 text-2xl">📚</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-yellow-600">
            Welcome to Bookshelf
          </h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-3 border-2 border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-3 py-3 border-2 border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {success && (
            <div
              className="bg-green-50 border-2 border-green-600 rounded-md p-3"
              role="status"
            >
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div
              className="bg-red-50 border-2 border-red-600 rounded-md p-3"
              role="alert"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 border-2 border-yellow-600 bg-yellow-400 text-yellow-900 font-medium rounded-md hover:bg-yellow-300 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-yellow-600 hover:text-yellow-500"
            >
              Sign up here
            </Link>
          </div>
          {/* Added "Forgot Password?" link to open the reset modal */}
          <div className="text-center text-sm mt-2">
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="font-medium text-yellow-600 hover:text-yellow-500"
            >
              Forgot password?
            </button>
          </div>
        </form>

        {/* Password Reset Modal */}
        {showReset && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" // Added p-4 for mobile spacing
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
          >
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => {
                  setShowReset(false);
                  setResetError(""); // Clear errors/success messages on close
                  setResetSuccess("");
                }}
                aria-label="Close reset password modal"
              >
                ×
              </button>
              <h2
                id="reset-password-title"
                className="text-xl font-bold mb-4 text-yellow-600"
              >
                Reset Password
              </h2>
              <form
                className="space-y-4"
                onSubmit={handleResetPassword}
                noValidate
              >
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border-2 border-yellow-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Email"
                  required
                  autoComplete="email"
                />
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full border-2 border-yellow-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="New Password"
                  required
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  className="w-full border-2 border-yellow-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Confirm Password"
                  required
                  autoComplete="new-password"
                />
                {resetError && (
                  <div
                    className="bg-red-50 border-2 border-red-600 rounded-md p-3"
                    role="alert"
                  >
                    <p className="text-red-600 text-sm">{resetError}</p>
                  </div>
                )}
                {resetSuccess && (
                  <div
                    className="bg-green-50 border-2 border-green-600 rounded-md p-3"
                    role="status"
                  >
                    <p className="text-green-600 text-sm">{resetSuccess}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2 bg-yellow-600 text-white font-semibold rounded border-2 border-yellow-700 hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
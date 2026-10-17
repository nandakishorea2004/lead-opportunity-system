
"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "../../src/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message ?? "Login failed.");
      } else {
        window.location.href = "/";
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">

        {/* App Icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M20 8v6" />
              <path d="M23 11h-6" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Login
          </h1>

          <p className="mt-3 text-slate-500">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-semibold text-slate-800"
            >
              Email Address
            </label>

            <div className="flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="pl-4 text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                className="w-full rounded-xl bg-transparent p-4 text-slate-900 outline-none placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-semibold text-slate-800"
            >
              Password
            </label>

            <div className="flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="pl-4 text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full min-w-0 bg-transparent p-4 text-slate-900 outline-none placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="px-4 text-slate-500 transition hover:text-blue-600"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m3 3 18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.3 4.5 9 7-.3 1.1-1.1 2.5-2.3 3.7" />
                    <path d="M6.2 6.2C3.9 7.7 2.4 10 2 12c.7 2.5 4 7 10 7 1.1 0 2.1-.2 3-.5" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {/* Login Message */}
          {message && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {message}
            </p>
          )}
        </form>

        {/* Registration Link */}
        <div className="mt-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-500">New user?</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mt-4 text-center">
            <Link
              href="/register"
              className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

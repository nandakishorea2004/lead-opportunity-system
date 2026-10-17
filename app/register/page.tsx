
"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "../../src/lib/auth-client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setIsError(true);
        setMessage(
          result.error.message ?? "Registration failed. Please try again."
        );
      } else {
        setMessage("Registration successful! You can now log in.");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch {
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen min-h-[100dvh] items-center justify-center overflow-x-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-3 py-6 sm:px-6 sm:py-10">
      <div className="w-full min-w-0 max-w-md">
        {/* Brand */}
        <div className="mb-5 text-center sm:mb-7">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 sm:h-16 sm:w-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-7 w-7 sm:h-8 sm:w-8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-5v6m-3-3h6"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create an Account
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 sm:text-sm">
            Join the Lead &amp; Opportunity Management System
          </p>
        </div>

        {/* Registration form */}
        <div className="min-w-0 rounded-2xl border border-white bg-white p-4 shadow-xl shadow-slate-200/70 sm:rounded-3xl sm:p-8">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
              Get started
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Enter your details to create your account.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full name */}
            <div className="min-w-0">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path
                    strokeLinecap="round"
                    d="M5 21v-2a7 7 0 0 1 14 0v2"
                  />
                </svg>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-base text-slate-800 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:pr-4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
            </div>

            {/* Email */}
            <div className="min-w-0">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path strokeLinecap="round" d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-base text-slate-800 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:pr-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="min-w-0">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                  />
                </svg>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  minLength={8}
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-[4.5rem] text-base text-slate-800 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:right-3"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use at least 8 characters.
              </p>
            </div>

            {/* Status message */}
            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`break-words rounded-xl border px-3 py-3 text-sm sm:px-4 ${
                  isError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {message}
                {!isError && (
                  <div className="mt-2">
                    <Link
                      href="/login"
                      className="inline-block rounded font-semibold underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      Go to login
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 shrink-0 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                    />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm leading-6 text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="inline-block rounded font-semibold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400 sm:mt-6">
          Lead &amp; Opportunity Management System
        </p>
      </div>
    </main>
  );
}

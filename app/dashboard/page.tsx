
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "../../src/lib/auth-client";

type DashboardStats = {
  totalLeads: number;
  totalOpportunities: number;
  openOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  readyToConvert: number;
};

const initialStats: DashboardStats = {
  totalLeads: 0,
  totalOpportunities: 0,
  openOpportunities: 0,
  wonOpportunities: 0,
  lostOpportunities: 0,
  readyToConvert: 0,
};

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
      <path d="m16 8 5-5M17 3h4v4" />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 5-7" />
      <path d="M15 6h5v5" />
    </svg>
  );
}

function WonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <circle cx="12" cy="12" r="10" />
      <path d="m7 12 3 3 7-7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 3c0 2.72-.78 7.5-5 11a22.35 22.35 0 0 1-5 1z" />
      <path d="m9 12-6 6" />
      <path d="M15 9h.01" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
      <path d="m12 2 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </svg>
  );
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const result = await authClient.getSession();

        if (active) {
          setRole(
            (result.data?.user as { role?: string } | undefined)?.role ??
              (result.data?.user ? "USER" : null)
          );
        }
      } catch (error) {
        console.error("Session loading error:", error);
        if (active) setRole(null);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    async function loadStats() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to load dashboard statistics");
        }

        const data: DashboardStats = await response.json();
        if (active) setStats(data);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSession();
    loadStats();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  }

  const cards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: <PeopleIcon />,
      color: "text-blue-600",
      circle: "bg-blue-50",
      shape: "bg-blue-50/80",
    },
    {
      title: "Opportunities",
      value: stats.totalOpportunities,
      icon: <TargetIcon />,
      color: "text-blue-600",
      circle: "bg-indigo-100",
      shape: "bg-indigo-50/80",
    },
    {
      title: "Won",
      value: stats.wonOpportunities,
      icon: <WonIcon />,
      color: "text-green-600",
      circle: "bg-green-100",
      shape: "bg-green-50/80",
    },
    {
      title: "Ready to Convert",
      value: stats.readyToConvert,
      icon: <GrowthIcon />,
      color: "text-emerald-600",
      circle: "bg-emerald-100",
      shape: "bg-emerald-50/80",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f1f5f9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-8">
        {/* Dashboard Header */}
        <header className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Lead Management System
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Track leads, manage customers, and grow opportunities.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!checkingSession && (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <UserIcon />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Account</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {role === "ADMIN"
                      ? "Administrator"
                      : role
                        ? "User"
                        : "Not logged in"}
                  </p>
                </div>
              </div>
            )}

            {!checkingSession && !role && (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Login
              </Link>
            )}

            {role && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
              >
                <LogoutIcon />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            )}
          </div>
        </header>

        {/* Dashboard Statistics Cards */}
        <section
          aria-label="Dashboard statistics"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative isolate flex min-h-[128px] items-center gap-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:px-7"
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 -z-10 h-40 w-40 rotate-45 ${card.shape}`}
                aria-hidden="true"
              />
              <div
                className={`pointer-events-none absolute -bottom-16 right-8 -z-10 h-28 w-28 rotate-45 ${card.shape}`}
                aria-hidden="true"
              />

              <div
                className={`flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full ${card.circle} ${card.color}`}
              >
                {card.icon}
              </div>

              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-500">
                  {card.title}
                </p>
                <h2 className={`mt-1 text-3xl font-bold ${card.color}`}>
                  {loading ? "..." : card.value}
                </h2>
              </div>
            </div>
          ))}
        </section>

        {/* Manage Your Leads */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <RocketIcon />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Manage Your Leads
              </h2>
              <p className="mt-2 text-slate-500">
                Start by adding a new potential customer to your system.
              </p>
            </div>
          </div>

          {/* All Actions in One Row on Desktop */}
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link
              href="/leads"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span className="text-xl leading-none">+</span>
              Create New Lead
            </Link>

            <Link
              href="/leads/list"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-600 px-3 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              <PeopleIcon />
              View All Leads
            </Link>

            <Link
              href="/opportunities"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-600 px-3 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              <TargetIcon />
              Convert Lead
            </Link>

            <Link
              href="/opportunities/list"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-600 px-3 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              <BriefcaseIcon />
              View Opportunities
            </Link>

            {!checkingSession && role === "ADMIN" && (
              <Link
                href="/admin/catalog"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-600 px-3 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-slate-700"
              >
                <CatalogIcon />
                Manage Catalog
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

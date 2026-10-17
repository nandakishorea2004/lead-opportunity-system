"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Opportunity = {
  id: number;
  leadId: number;
  productOrService: string;
  dealAmount: string | number;
  expectedMarginPercent: string | number;
  expectedMarginAmount: string | number;
  status: "OPEN" | "WON" | "LOST";
  lossReason: string | null;
  createdAt: string;
  lead: {
    personName: string;
    companyName: string;
    email: string;
  };
};

export default function OpportunityListPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [statusToSet, setStatusToSet] = useState<"WON" | "LOST" | null>(null);
  const [lossReason, setLossReason] = useState("");

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/opportunities");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load opportunities.");
      }

      setOpportunities(result.opportunities ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load opportunities. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOpportunities();
  }, [loadOpportunities]);

  function formatCurrency(value: string | number) {
    return Number(value).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDate(date: string) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function openStatusForm(opportunity: Opportunity, status: "WON" | "LOST") {
    setSelectedOpportunity(opportunity);
    setStatusToSet(status);
    setLossReason("");
    setMessage("");
    setError("");
  }

  function closeStatusForm() {
    if (savingId !== null) return;

    setSelectedOpportunity(null);
    setStatusToSet(null);
    setLossReason("");
  }

  async function saveStatus() {
    if (!selectedOpportunity || !statusToSet) return;

    const cleanedReason = lossReason.trim();

    if (statusToSet === "LOST" && !cleanedReason) {
      setError("Please enter a reason for losing this opportunity.");
      return;
    }

    setSavingId(selectedOpportunity.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/opportunities/${selectedOpportunity.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: statusToSet,
            lossReason: statusToSet === "LOST" ? cleanedReason : null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not update opportunity status."
        );
      }

      setMessage(
        statusToSet === "WON"
          ? "Opportunity marked as Won."
          : "Opportunity marked as Lost."
      );

      setSelectedOpportunity(null);
      setStatusToSet(null);
      setLossReason("");

      await loadOpportunities();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-[1600px]">
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex max-w-full items-center justify-center gap-2 rounded-lg bg-slate-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 sm:px-4"
          >
            <span className="text-lg">←</span>
            Back to Dashboard
          </Link>
        </div>

        <header className="mb-5 flex min-w-0 flex-col gap-4 rounded-2xl border border-white bg-white/95 p-4 shadow-sm sm:mb-6 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl sm:h-16 sm:w-16 sm:rounded-2xl sm:text-3xl">
              📊
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                Opportunity List
              </h1>
              <p className="mt-1 break-words text-sm text-slate-500 sm:mt-2 sm:text-base">
                View and track your saved business opportunities.
              </p>
            </div>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-fit sm:px-6 sm:py-3.5"
          >
            <span className="text-xl">+</span>
            Convert Lead
          </Link>
        </header>

        {message && (
          <div
            role="status"
            className="mb-4 break-words rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800 sm:p-4"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4"
          >
            {error}
          </div>
        )}

        <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-white bg-white/95 shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                All Opportunities
              </h2>
              <p className="mt-1 break-words text-sm text-slate-500">
                Business deals created from converted leads.
              </p>
            </div>

            {!loading && !error && (
              <span className="w-fit max-w-full shrink-0 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 sm:px-4">
                {opportunities.length}{" "}
                {opportunities.length === 1 ? "Opportunity" : "Opportunities"}
              </span>
            )}
          </div>

          {loading ? (
            <div
              role="status"
              className="flex min-h-64 items-center justify-center gap-3 p-5 sm:p-8"
            >
              <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="text-sm font-medium text-slate-600">
                Loading opportunities...
              </p>
            </div>
          ) : error && opportunities.length === 0 ? (
            <div className="p-5 text-center sm:p-8">
              <h3 className="font-semibold text-slate-900">
                Unable to load opportunities
              </h3>
              <p className="mt-2 break-words text-sm text-slate-600">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadOpportunities()}
                className="mt-5 min-h-11 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-5 text-center sm:min-h-80 sm:p-8">
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                No opportunities yet
              </h3>
              <p className="mt-2 max-w-md break-words text-sm leading-6 text-slate-500">
                Your saved business opportunities will appear here. Convert an
                existing lead to create your first opportunity.
              </p>
              <Link
                href="/opportunities"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 sm:w-fit"
              >
                + Convert Lead
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto overscroll-x-contain p-3 sm:p-6">
              <table className="w-full min-w-[1250px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-600">
                    <th className="rounded-l-xl px-4 py-5">ID</th>
                    <th className="px-4 py-5">Lead</th>
                    <th className="px-4 py-5">Company</th>
                    <th className="px-4 py-5">Product / Service</th>
                    <th className="px-4 py-5">Deal Amount</th>
                    <th className="px-4 py-5">Margin %</th>
                    <th className="px-4 py-5">Margin Amount</th>
                    <th className="px-4 py-5">Created Date</th>
                    <th className="px-4 py-5">Status</th>
                    <th className="px-4 py-5">Loss Reason</th>
                    <th className="rounded-r-xl px-4 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opportunities.map((opportunity) => {
                    const status = opportunity.status ?? "OPEN";

                    return (
                      <tr
                        key={opportunity.id}
                        className="transition hover:bg-blue-50/50"
                      >
                        <td className="whitespace-nowrap px-4 py-5 text-sm font-semibold text-slate-700">
                          {opportunity.id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {opportunity.lead?.personName ?? "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {opportunity.lead?.email ?? ""}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-600">
                          {opportunity.lead?.companyName ?? "—"}
                        </td>
                        <td className="px-4 py-5">
                          <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                            {opportunity.productOrService}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-5 text-sm font-semibold text-slate-800">
                          {formatCurrency(opportunity.dealAmount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-600">
                          {Number(opportunity.expectedMarginPercent).toFixed(2)}%
                        </td>
                        <td className="whitespace-nowrap px-4 py-5 text-sm font-semibold text-emerald-700">
                          {formatCurrency(opportunity.expectedMarginAmount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-600">
                          {formatDate(opportunity.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                              status === "WON"
                                ? "bg-green-100 text-green-800"
                                : status === "LOST"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="max-w-56 px-4 py-5 text-sm text-slate-600">
                          {status === "LOST"
                            ? opportunity.lossReason || "—"
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-5">
                          {status === "OPEN" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openStatusForm(opportunity, "WON")
                                }
                                className="min-h-10 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                              >
                                Mark Won
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openStatusForm(opportunity, "LOST")
                                }
                                className="min-h-10 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                Mark Lost
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">
                              Final status
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedOpportunity && statusToSet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeStatusForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-dialog-title"
            className="my-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6"
          >
            <h2
              id="status-dialog-title"
              className="break-words text-lg font-bold text-slate-900 sm:text-xl"
            >
              {statusToSet === "WON"
                ? "Mark Opportunity as Won"
                : "Mark Opportunity as Lost"}
            </h2>
            <p className="mt-2 break-words text-sm text-slate-600">
              Opportunity #{selectedOpportunity.id} —{" "}
              {selectedOpportunity.lead?.personName ?? "—"}
            </p>

            {statusToSet === "LOST" && (
              <div className="mt-5">
                <label
                  htmlFor="lossReason"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Reason for Loss <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="lossReason"
                  value={lossReason}
                  onChange={(event) => setLossReason(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  required
                  placeholder="Explain why this opportunity was lost..."
                  className="w-full resize-y rounded-xl border border-slate-300 p-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                />
              </div>
            )}

            {error && (
              <p role="alert" className="mt-3 break-words text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={savingId !== null}
                onClick={closeStatusForm}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingId !== null}
                onClick={() => void saveStatus()}
                className={`min-h-11 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto ${
                  statusToSet === "WON"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {savingId !== null
                  ? "Saving..."
                  : statusToSet === "WON"
                    ? "Confirm Won"
                    : "Confirm Lost"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
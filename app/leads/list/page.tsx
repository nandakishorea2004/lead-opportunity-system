
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lead = {
  id: number;
  personName: string;
  companyName: string;
  mobile: string;
  email: string;
  requirement: string;
  nextStep: string;
  warmth: string;
  createdAt: string;
  convertedAt?: string | null;
};

export default function LeadListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [confirmDeleteLead, setConfirmDeleteLead] =
    useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const leadsPerPage = 8;

  async function fetchLeads() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/leads");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to load leads.");
      }

      setLeads(result.leads ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading leads."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLeads();
  }, []);

  async function handleDeleteLead() {
    if (!confirmDeleteLead || deleting) return;

    const leadId = confirmDeleteLead.id;

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteError(
          result.message ||
            result.error ||
            "Failed to delete lead."
        );
        return;
      }

      const updatedLeads = leads.filter((lead) => lead.id !== leadId);

      setLeads(updatedLeads);
      setSelectedLead(null);
      setConfirmDeleteLead(null);
      setDeleteError("");

      const newTotalPages = Math.max(
        1,
        Math.ceil(updatedLeads.length / leadsPerPage)
      );

      setCurrentPage((page) => Math.min(page, newTotalPages));
    } catch (err) {
      console.error("Error deleting lead:", err);
      setDeleteError(
        "Could not connect to the server. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  function getWarmthStyle(warmth: string) {
    switch (warmth.toLowerCase()) {
      case "ready now":
      case "hot":
        return "bg-red-100 text-red-700";
      case "interested":
      case "warm":
        return "bg-orange-100 text-orange-700";
      case "curious":
      case "cold":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function formatDate(date: string) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const totalPages = Math.max(
    1,
    Math.ceil(leads.length / leadsPerPage)
  );

  const startIndex = (currentPage - 1) * leadsPerPage;

  const displayedLeads = leads.slice(
    startIndex,
    startIndex + leadsPerPage
  );

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              <span className="text-lg">←</span>
              Back to Dashboard
            </Link>
          </div>

          <section className="mb-5 flex flex-col gap-5 rounded-2xl border border-white bg-white/95 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                👥
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Lead List
                </h1>
                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Leads retrieved from your PostgreSQL database.
                </p>
              </div>
            </div>

            <Link
              href="/opportunities"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span className="text-xl leading-none">↗</span>
              Convert to Opportunity
            </Link>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white bg-white/95 shadow-sm">
            {loading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-4 p-8">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <p className="text-sm font-medium text-slate-500">
                  Loading leads...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="mb-3 text-4xl">⚠️</div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Unable to load leads
                </h2>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchLeads()}
                  className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                  👥
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  No leads yet
                </h2>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Start building your customer pipeline by creating your
                  first lead.
                </p>
                <Link
                  href="/leads"
                  className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  + Create Your First Lead
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto p-4 sm:p-6">
                  <table className="w-full min-w-[1350px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-600">
                        <th className="rounded-l-xl px-4 py-5">ID</th>
                        <th className="px-4 py-5">Person</th>
                        <th className="px-4 py-5">Company</th>
                        <th className="px-4 py-5">Mobile</th>
                        <th className="px-4 py-5">Email</th>
                        <th className="px-4 py-5">Requirement</th>
                        <th className="px-4 py-5">Next Step</th>
                        <th className="px-4 py-5">Warmth</th>
                        <th className="px-4 py-5">Created Date</th>
                        <th className="px-4 py-5">Status</th>
                        <th className="rounded-r-xl px-4 py-5">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {displayedLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="transition hover:bg-blue-50/50"
                        >
                          <td className="whitespace-nowrap px-4 py-5 text-sm font-semibold text-slate-700">
                            {lead.id}
                          </td>
                          <td className="whitespace-nowrap px-4 py-5 text-sm font-medium text-slate-700">
                            {lead.personName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-600">
                            {lead.companyName || "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-600">
                            {lead.mobile}
                          </td>
                          <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-600">
                            {lead.email}
                          </td>
                          <td className="max-w-xs px-4 py-5 text-sm text-slate-600">
                            <div className="whitespace-normal">
                              {lead.requirement}
                            </div>
                          </td>
                          <td className="px-4 py-5 text-sm text-slate-600">
                            {lead.nextStep}
                          </td>
                          <td className="px-4 py-5">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getWarmthStyle(
                                lead.warmth
                              )}`}
                            >
                              {lead.warmth}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-600">
                            {formatDate(lead.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-5">
                            {lead.convertedAt ? (
                              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Converted
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                Not Converted
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLead(lead);
                                setDeleteError("");
                              }}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + leadsPerPage, leads.length)} of{" "}
                    {leads.length} leads
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ‹
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        type="button"
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setSelectedLead(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2
                  id="lead-details-title"
                  className="text-2xl font-bold text-slate-900"
                >
                  Lead Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Complete information for Lead #{selectedLead.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                aria-label="Close lead details"
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Person Name</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedLead.personName || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Company Name</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedLead.companyName || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Mobile Number</p>
                <p className="mt-1 break-words font-semibold text-slate-800">
                  {selectedLead.mobile || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Email Address</p>
                <p className="mt-1 break-words font-semibold text-slate-800">
                  {selectedLead.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Next Step</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedLead.nextStep || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Lead Warmth</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getWarmthStyle(
                    selectedLead.warmth
                  )}`}
                >
                  {selectedLead.warmth || "—"}
                </span>
              </div>

              <div className="sm:col-span-2">
                <p className="text-sm text-slate-500">Requirement</p>
                <p className="mt-1 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedLead.requirement || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Created Date</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {formatDate(selectedLead.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Conversion Status</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedLead.convertedAt
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {selectedLead.convertedAt ? "Converted" : "Not Converted"}
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5">
              {deleteError && !confirmDeleteLead && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                  {deleteError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setConfirmDeleteLead(selectedLead);
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Delete Lead
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteLead && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => {
            if (!deleting) {
              setConfirmDeleteLead(null);
              setDeleteError("");
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-lead-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
              !
            </div>

            <h2
              id="delete-lead-title"
              className="text-xl font-bold text-slate-900"
            >
              Delete Lead?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <strong>{confirmDeleteLead.personName}</strong> (Lead #
              {confirmDeleteLead.id})? This action may be permanent.
            </p>

            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setConfirmDeleteLead(null);
                  setDeleteError("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteLead}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

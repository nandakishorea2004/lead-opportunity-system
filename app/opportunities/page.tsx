
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lead = {
  id: number;
  personName: string;
  companyName: string;
  requirement: string;
  convertedAt: string | null;
  opportunity?: { id: number } | null;
};

type CatalogItem = {
  id: number;
  name: string;
  type: "Product" | "Service";
  isActive: boolean;
};

export default function OpportunitiesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [leadId, setLeadId] = useState("");
  const [productOrService, setProductOrService] = useState("");
  const [selectedType, setSelectedType] =
    useState<"Product" | "Service">("Product");
  const [dealAmount, setDealAmount] = useState("");
  const [marginPercent, setMarginPercent] = useState("20");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [leadsResponse, catalogResponse] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/catalog"),
        ]);

        const leadsResult = await leadsResponse.json();
        const catalogResult = await catalogResponse.json();

        if (!leadsResponse.ok) {
          throw new Error(leadsResult.message || "Could not load leads.");
        }

        if (!catalogResponse.ok) {
          throw new Error(
            catalogResult.message || "Could not load products and services."
          );
        }

        setLeads(leadsResult.leads ?? []);
        setCatalogItems(
          (catalogResult.items ?? []).filter(
            (item: CatalogItem) => item.isActive
          )
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load the form data. Please refresh."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const availableLeads = leads.filter(
    (lead) => !lead.convertedAt && !lead.opportunity
  );

  const selectedLead = availableLeads.find(
    (lead) => lead.id === Number(leadId)
  );

  const filteredCatalogItems = catalogItems.filter(
    (item) => item.type === selectedType
  );

  const amount = Number(dealAmount);
  const margin = Number(marginPercent);

  const validAmount =
    dealAmount.trim() !== "" &&
    Number.isFinite(amount) &&
    amount > 0;

  const validMargin =
    marginPercent.trim() !== "" &&
    Number.isFinite(margin) &&
    margin >= 0 &&
    margin <= 100;

  const expectedMargin =
    validAmount && validMargin ? (amount * margin) / 100 : 0;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (!selectedLead || !productOrService.trim()) {
      setMessage("Select a lead and a product or service.");
      return;
    }

    if (!validAmount || !validMargin) {
      setMessage(
        "Enter a deal amount greater than zero and a margin from 0 to 100."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: Number(leadId),
          productOrService: productOrService.trim(),
          selectedType,
          dealAmount: amount,
          expectedMarginPercent: margin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not create opportunity."
        );
      }

      setMessage("Opportunity created successfully!");

      setLeads((current) =>
        current.filter((lead) => lead.id !== Number(leadId))
      );

      setLeadId("");
      setProductOrService("");
      setDealAmount("");
      setMarginPercent("20");
      setSelectedType("Product");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:px-4";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-800";

  return (
    <main className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-5xl">
        {/* Back to Dashboard */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 sm:px-4"
          >
            <span className="text-lg" aria-hidden="true">
              ←
            </span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <header className="mb-5 flex min-w-0 flex-col gap-4 rounded-2xl border border-white bg-white/95 p-4 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:p-6 lg:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl sm:h-16 sm:w-16 sm:rounded-2xl sm:text-3xl">
            👥
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Convert Lead to Opportunity
            </h1>
            <p className="mt-2 break-words text-sm leading-6 text-slate-500 sm:text-base">
              Review the customer&apos;s requirement before creating an
              opportunity.
            </p>
          </div>
        </header>

        {/* Opportunity Form */}
        <section className="min-w-0 rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          {loading ? (
            <div
              role="status"
              className="flex min-h-56 flex-col items-center justify-center gap-3 sm:min-h-64 sm:flex-row"
            >
              <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="text-center text-sm font-medium text-slate-600">
                Loading leads and products...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 sm:mb-7">
                <h2 className="text-xl font-bold text-slate-900">
                  Opportunity Details
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Complete the details below to convert a lead.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Select Lead */}
                <div className="min-w-0">
                  <label htmlFor="lead" className={labelClass}>
                    Select Lead <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="lead"
                    value={leadId}
                    onChange={(event) => {
                      setLeadId(event.target.value);
                      setMessage("");
                    }}
                    required
                    className={inputClass}
                  >
                    <option value="">Choose a lead</option>

                    {availableLeads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.personName} — {lead.companyName}
                      </option>
                    ))}
                  </select>

                  {availableLeads.length === 0 && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800">
                      ⚠ No unconverted leads are available.
                    </p>
                  )}
                </div>

                {/* Customer Requirement */}
                {selectedLead && (
                  <section className="min-w-0 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 sm:p-5">
                    <div className="mb-4 flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
                        👤
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words font-bold text-slate-900">
                          Customer Requirement
                        </h3>
                        <p className="text-xs text-slate-500">
                          Selected lead information
                        </p>
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">
                          Person Name
                        </p>
                        <p className="mt-1 break-words font-semibold text-slate-900">
                          {selectedLead.personName}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">
                          Company Name
                        </p>
                        <p className="mt-1 break-words font-semibold text-slate-900">
                          {selectedLead.companyName}
                        </p>
                      </div>

                      <div className="min-w-0 sm:col-span-2">
                        <p className="text-xs font-medium text-slate-500">
                          Requirement
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800 [overflow-wrap:anywhere]">
                          {selectedLead.requirement?.trim() ||
                            "No requirement was recorded for this lead."}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Product or Service Type */}
                <div className="min-w-0">
                  <label htmlFor="itemType" className={labelClass}>
                    Select Type <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="itemType"
                    value={selectedType}
                    onChange={(event) => {
                      setSelectedType(
                        event.target.value as "Product" | "Service"
                      );
                      setProductOrService("");
                      setMessage("");
                    }}
                    className={inputClass}
                  >
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                  </select>
                </div>

                {/* Catalog Item */}
                <div className="min-w-0">
                  <label htmlFor="catalogItem" className={labelClass}>
                    Select Product or Service{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="catalogItem"
                    value={productOrService}
                    onChange={(event) => {
                      setProductOrService(event.target.value);
                      setMessage("");
                    }}
                    required
                    className={inputClass}
                  >
                    <option value="">
                      Choose a {selectedType.toLowerCase()}
                    </option>

                    {filteredCatalogItems.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {filteredCatalogItems.length === 0 && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800">
                      ⚠ No active {selectedType.toLowerCase()} items found.
                      Add or activate an item in Admin Catalog.
                    </p>
                  )}
                </div>

                {/* Deal Amount and Margin */}
                <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor="dealAmount" className={labelClass}>
                      Deal Amount (₹){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="dealAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Enter deal amount"
                      value={dealAmount}
                      onChange={(event) =>
                        setDealAmount(event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="margin" className={labelClass}>
                      Expected Margin (%){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="margin"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Enter margin percentage"
                      value={marginPercent}
                      onChange={(event) =>
                        setMarginPercent(event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Expected Margin Calculation */}
                <div className="min-w-0 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl sm:h-12 sm:w-12 sm:text-2xl">
                      🧮
                    </div>

                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-blue-700">
                        Expected Margin Amount
                      </p>
                      <p className="mt-1 break-words text-2xl font-bold text-blue-800 sm:text-3xl">
                        ₹
                        {expectedMargin.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Success and Error Messages */}
                {message && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`break-words rounded-xl border p-3 text-sm leading-6 sm:p-4 ${
                      message.includes("successfully")
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {message.includes("successfully") ? "✓ " : "ℹ "}
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !selectedLead ||
                    !validAmount ||
                    !validMargin ||
                    !productOrService ||
                    filteredCatalogItems.length === 0
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-4 sm:text-base"
                >
                  {saving ? (
                    <>
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span>Creating Opportunity...</span>
                    </>
                  ) : (
                    <>➜ Convert to Opportunity</>
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}


"use client";

import { useState } from "react";
import Link from "next/link";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const countries: { code: CountryCode; name: string; dial: string }[] = [
  { code: "IN", name: "India", dial: "+91" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "PH", name: "Philippines", dial: "+63" },
];

export default function LeadsPage() {
  const initialForm = {
    personName: "",
    companyName: "",
    mobile: "",
    email: "",
    requirement: "",
    nextStep: "Call Tomorrow",
    warmth: "Curious",
  };

  const [form, setForm] = useState(initialForm);
  const [country, setCountry] = useState<CountryCode>("IN");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-800 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:px-4 sm:text-sm sm:placeholder:text-sm";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  }

  function handleCountryChange(value: string) {
    setCountry(value as CountryCode);
    setMessage("");
    setMessageType("");
  }

  function validatePhone() {
    const input = form.mobile.trim();

    if (!input) {
      return {
        valid: false,
        message: "Mobile number is required.",
        internationalNumber: "",
      };
    }

    const phone = parsePhoneNumberFromString(
      input,
      input.startsWith("+") ? undefined : country
    );

    if (!phone || !phone.isValid()) {
      return {
        valid: false,
        message:
          "Enter a valid phone number for the selected country, including the country code if needed.",
        internationalNumber: "",
      };
    }

    return {
      valid: true,
      message: "",
      internationalNumber: phone.number,
    };
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const phoneResult = validatePhone();

    if (!phoneResult.valid) {
      setMessage(phoneResult.message);
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          mobile: phoneResult.internationalNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to save lead.");
        setMessageType("error");
        return;
      }

      setForm({ ...initialForm });
      setCountry("IN");
      setMessage("Lead saved successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Error submitting lead:", error);
      setMessage("Could not connect to the server. Please try again.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const selectedCountry = countries.find(
    (item) => item.code === country
  );

  return (
    <main className="min-h-screen min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-5xl">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:mb-6 sm:px-4"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <path
              d="m15 18-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 12H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Dashboard
        </Link>

        {/* Page heading */}
        <section className="mb-6 flex min-w-0 items-start gap-3 sm:mb-7 sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 sm:h-14 sm:w-14">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-6 w-6 sm:h-7 sm:w-7"
              aria-hidden="true"
            >
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="7" r="4" />
              <path
                d="M19 8v6m3-3h-6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              New Lead
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">
              Capture customer details and understand their requirements.
            </p>
          </div>
        </section>

        {/* Lead form */}
        <form
          onSubmit={handleSubmit}
          className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-4 py-4 sm:px-8 sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path
                    d="M5 21v-2a7 7 0 0 1 14 0v2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900">
                  Customer Information
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Fields marked * are required.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-4 py-5 sm:space-y-7 sm:px-8 sm:py-8">
            {/* Contact and company details */}
            <section className="min-w-0">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact &amp; Company Details
              </h3>

              <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="personName" className={labelClass}>
                    Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="personName"
                    name="personName"
                    value={form.personName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="companyName" className={labelClass}>
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                    autoComplete="organization"
                    className={inputClass}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="country" className={labelClass}>
                    Country / Dialing Code{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(event) =>
                      handleCountryChange(event.target.value)
                    }
                    className={inputClass}
                  >
                    {countries.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.dial})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label htmlFor="mobile" className={labelClass}>
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    className={inputClass}
                    placeholder={
                      selectedCountry
                        ? `Enter number for ${selectedCountry.name}`
                        : "Enter international phone number"
                    }
                    aria-describedby="mobile-help"
                  />
                  <p
                    id="mobile-help"
                    className="mt-1.5 break-words text-xs leading-5 text-slate-500"
                  >
                    Selected code: {selectedCountry?.dial}. You may also
                    enter a complete international number beginning with +.
                  </p>
                </div>

                <div className="min-w-0 sm:col-span-2">
                  <label htmlFor="email" className={labelClass}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            </section>

            {/* Customer requirement */}
            <section className="min-w-0">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Requirement
              </h3>

              <label htmlFor="requirement" className={labelClass}>
                What They Need <span className="text-red-500">*</span>
              </label>
              <textarea
                id="requirement"
                name="requirement"
                value={form.requirement}
                onChange={handleChange}
                required
                rows={4}
                className={`${inputClass} resize-y`}
                placeholder="Describe the customer's needs, challenges, or requested solution..."
              />
            </section>

            {/* Follow-up and warmth */}
            <section className="min-w-0">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Follow-up &amp; Lead Warmth
              </h3>

              <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="nextStep" className={labelClass}>
                    Next Step
                  </label>
                  <select
                    id="nextStep"
                    name="nextStep"
                    value={form.nextStep}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option>Send Pricing</option>
                    <option>Call Tomorrow</option>
                    <option>Book a Meeting</option>
                    <option>Just a Note</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label htmlFor="warmth" className={labelClass}>
                    Lead Warmth
                  </label>
                  <select
                    id="warmth"
                    name="warmth"
                    value={form.warmth}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option>Curious</option>
                    <option>Interested</option>
                    <option>Ready Now</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Status message */}
            {message && (
              <div
                role={messageType === "error" ? "alert" : "status"}
                className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 text-sm sm:p-4 ${
                  messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <span className="shrink-0 font-bold">
                  {messageType === "success" ? "✓" : "!"}
                </span>
                <p className="min-w-0 break-words">{message}</p>
              </div>
            )}
          </div>

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
            <p className="text-xs leading-5 text-slate-500">
              Please review the information before saving.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <>
                  <svg
                    className="h-4 w-4 shrink-0 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Saving Lead...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5v14m-7-7h14"
                      strokeLinecap="round"
                    />
                  </svg>
                  Save Lead
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Lead Management &amp; Opportunity Management System
        </p>
      </div>
    </main>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CatalogItem = {
  id: number;
  name: string;
  type: "Product" | "Service";
  isActive: boolean;
};

export default function AdminCatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"Product" | "Service">("Product");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"Product" | "Service">("Product");

  async function loadItems() {
    try {
      const response = await fetch("/api/catalog");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load catalog.");
      }

      setItems(data.items ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load catalog."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Item name is required.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add item.");
      }

      setMessage(data.message || "Catalog item added successfully.");
      setMessageType("success");
      setName("");
      await loadItems();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add item."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleItem(item: CatalogItem) {
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isActive: !item.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update item.");
      }

      setMessage(data.message || "Catalog item updated successfully.");
      setMessageType("success");
      await loadItems();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update item."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(item: CatalogItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditType(item.type);
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditType("Product");
  }

  async function saveEdit(item: CatalogItem) {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      setMessage("Item name is required.");
      setMessageType("error");
      return;
    }

    if (trimmedName.length > 100) {
      setMessage("Item name cannot exceed 100 characters.");
      setMessageType("error");
      return;
    }

    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          name: trimmedName,
          type: editType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not edit item.");
      }

      setMessage(data.message || "Catalog item updated successfully.");
      setMessageType("success");
      cancelEditing();
      await loadItems();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not edit item."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:px-4";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  const activeCount = items.filter((item) => item.isActive).length;
  const inactiveCount = items.length - activeCount;
  const productCount = items.filter((item) => item.type === "Product").length;
  const serviceCount = items.filter((item) => item.type === "Service").length;

  const summaryCards = [
    {
      title: "Total Items",
      count: items.length,
      color: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      title: "Products",
      count: productCount,
      color: "bg-indigo-100",
      text: "text-indigo-700",
    },
    {
      title: "Services",
      count: serviceCount,
      color: "bg-purple-100",
      text: "text-purple-700",
    },
    {
      title: "Active Items",
      count: activeCount,
      color: "bg-green-100",
      text: "text-green-700",
    },
  ];

  return (
    <main className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
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
            🗂️
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Product &amp; Service Catalog
            </h1>
            <p className="mt-2 break-words text-sm leading-6 text-slate-500 sm:text-base">
              Manage the products and services your business offers.
            </p>
          </div>
        </header>

        {/* Feedback Message */}
        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-5 break-words rounded-xl border p-3 text-sm leading-6 sm:mb-6 sm:p-4 ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {messageType === "success" ? "✓ " : "⚠ "}
            {message}
          </div>
        )}

        {/* Catalog Summary */}
        <section
          aria-label="Catalog summary"
          className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
        >
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="flex min-w-0 items-center gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color} ${card.text}`}
                aria-hidden="true"
              >
                <span className="text-lg font-bold">
                  {card.title === "Total Items"
                    ? "#"
                    : card.title === "Products"
                      ? "P"
                      : card.title === "Services"
                        ? "S"
                        : "✓"}
                </span>
              </div>

              <div className="min-w-0">
                <p className="break-words text-sm text-slate-500">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "—" : card.count}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Add Item Form */}
        <section className="mb-5 min-w-0 rounded-2xl border border-white bg-white p-4 shadow-sm sm:mb-6 sm:p-6 lg:p-7">
          <div className="mb-5 flex min-w-0 items-center gap-3 sm:mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl sm:h-11 sm:w-11">
              +
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900">
                Add Catalog Item
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Add a new product or service to your catalog.
              </p>
            </div>
          </div>

          <form
            onSubmit={addItem}
            className="grid min-w-0 grid-cols-1 items-end gap-4 sm:gap-5 md:grid-cols-3"
          >
            <div className="min-w-0">
              <label htmlFor="new-item-name" className={labelClass}>
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                id="new-item-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                placeholder="Example: EDR or VAPT"
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="new-item-type" className={labelClass}>
                Item Type <span className="text-red-500">*</span>
              </label>
              <select
                id="new-item-type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as "Product" | "Service")
                }
                className={inputClass}
              >
                <option value="Product">Product</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              <span className="text-xl">+</span>
              {saving ? "Please wait..." : "Add Item"}
            </button>
          </form>
        </section>

        {/* Existing Catalog Items */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-7">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900">
                Existing Items
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Edit item details or control which items are available.
              </p>
            </div>

            {!loading && (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  {activeCount} Active
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {inactiveCount} Inactive
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div
              role="status"
              className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 sm:flex-row"
            >
              <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="text-sm text-slate-500">Loading catalog...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center sm:p-10">
              <div className="mb-3 text-4xl">🗂️</div>
              <h3 className="font-semibold text-slate-900">
                No catalog items found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use the form above to add your first product or service.
              </p>
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto overscroll-x-contain p-3 sm:p-5 lg:p-6">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-600">
                    <th className="rounded-l-xl px-3 py-4 sm:px-4">
                      Item Name
                    </th>
                    <th className="px-3 py-4 sm:px-4">Type</th>
                    <th className="px-3 py-4 sm:px-4">Status</th>
                    <th className="rounded-r-xl px-3 py-4 sm:px-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-blue-50/50"
                    >
                      <td className="max-w-xs px-3 py-4 sm:px-4">
                        {editingId === item.id ? (
                          <input
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            required
                            maxLength={100}
                            aria-label="Edit item name"
                            className="w-full min-w-40 rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        ) : (
                          <span className="break-words font-semibold text-slate-800">
                            {item.name}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-4 sm:px-4">
                        {editingId === item.id ? (
                          <select
                            value={editType}
                            onChange={(event) =>
                              setEditType(
                                event.target.value as "Product" | "Service"
                              )
                            }
                            aria-label="Edit item type"
                            className="rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                          >
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              item.type === "Product"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {item.type}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-4 sm:px-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            item.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.isActive ? "bg-green-500" : "bg-slate-400"
                            }`}
                          />
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-3 py-4 sm:px-4">
                        <div className="flex flex-wrap gap-2">
                          {editingId === item.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(item)}
                                disabled={saving || !editName.trim()}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={saving}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditing(item)}
                                disabled={saving}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleItem(item)}
                                disabled={saving}
                                className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                                  item.isActive
                                    ? "border-orange-200 text-orange-700 hover:bg-orange-50"
                                    : "border-green-200 text-green-700 hover:bg-green-50"
                                }`}
                              >
                                {item.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 break-words text-center text-xs text-slate-400">
          Catalog Management · Admin Access
        </p>
      </div>
    </main>
  );
}

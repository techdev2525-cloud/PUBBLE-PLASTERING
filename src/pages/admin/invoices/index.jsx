// Admin Invoices List Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiMail,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

const statusConfig = {
  DRAFT: {
    label: "Draft",
    icon: FiEdit2,
    color: "bg-concrete-100 text-concrete-600",
  },
  SENT: { label: "Sent", icon: FiMail, color: "bg-blue-100 text-blue-600" },
  PAID: { label: "Paid", icon: FiCheck, color: "bg-green-100 text-green-600" },
  OVERDUE: {
    label: "Overdue",
    icon: FiAlertCircle,
    color: "bg-red-100 text-red-600",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: FiAlertCircle,
    color: "bg-concrete-100 text-concrete-500",
  },
};

export default function InvoicesListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/invoices?${params}`);
      if (!res.ok) throw new Error("Failed to fetch invoices");

      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const filteredInvoices = invoices;

  const totals = {
    all: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
    paid: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + (i.total || 0), 0),
    pending: invoices
      .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
      .reduce((sum, i) => sum + (i.total || 0), 0),
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete invoice");
        fetchInvoices();
      } catch (err) {
        alert("Error deleting invoice: " + err.message);
      }
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <>
        <Head>
          <title>
            Invoices | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Invoices">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          Invoices | Admin - {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Invoices">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-concrete-500 mb-1">Total Invoiced</p>
            <p className="text-2xl font-bold text-concrete-800">
              £{totals.all.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-concrete-500 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              £{totals.paid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-concrete-500 mb-1">Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">
              £{totals.pending.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            New Invoice
          </Link>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-concrete-50 border-b border-concrete-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Invoice
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden md:table-cell">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-concrete-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {filteredInvoices.map((invoice) => {
                  const status =
                    statusConfig[invoice.status] || statusConfig.DRAFT;
                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-concrete-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="font-medium text-concrete-800 hover:text-primary-600"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        <p className="text-xs text-concrete-400 mt-1">
                          Due:{" "}
                          {new Date(invoice.dueDate).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-concrete-700">
                        {invoice.client?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-concrete-500 text-sm hidden md:table-cell">
                        {invoice.project?.title || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-concrete-800">
                          £{(invoice.total || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-concrete-400 block">
                          (inc. £{invoice.vatAmount || 0} VAT)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-concrete-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <FiDownload className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-concrete-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <FiMail className="w-5 h-5" />
                          </button>
                          <Link
                            href={`/admin/invoices/${invoice.id}`}
                            className="p-2 text-concrete-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-2 text-concrete-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-concrete-500">No invoices found</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

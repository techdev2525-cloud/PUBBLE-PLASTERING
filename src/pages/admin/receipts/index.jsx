// Admin Receipts List Page
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
  FiCreditCard,
  FiLoader,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

const paymentMethodLabels = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
};

export default function ReceiptsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/receipts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch receipts");

      const data = await res.json();
      setReceipts(data.receipts || []);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReceipts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredReceipts = receipts;

  const totalReceived = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      try {
        const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete receipt");
        fetchReceipts();
      } catch (err) {
        alert("Error deleting receipt: " + err.message);
      }
    }
  };

  if (loading && receipts.length === 0) {
    return (
      <>
        <Head>
          <title>
            Receipts | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Receipts">
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
          Receipts | Admin - {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Receipts">
        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-concrete-500 mb-1">
                Total Received (This Month)
              </p>
              <p className="text-3xl font-bold text-green-600">
                £{totalReceived.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FiCreditCard className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipts..."
              className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Link
            href="/admin/receipts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            New Receipt
          </Link>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-concrete-50 border-b border-concrete-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Receipt
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden md:table-cell">
                    Invoice
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden md:table-cell">
                    Payment Method
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-concrete-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {filteredReceipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="hover:bg-concrete-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/receipts/${receipt.id}`}
                        className="font-medium text-concrete-800 hover:text-primary-600"
                      >
                        {receipt.receiptNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-concrete-700">
                      {receipt.client?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-concrete-500 text-sm hidden md:table-cell">
                      {receipt.invoice?.invoiceNumber || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        £{receipt.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-concrete-600 hidden md:table-cell">
                      {paymentMethodLabels[receipt.paymentMethod]}
                    </td>
                    <td className="px-6 py-4 text-concrete-500 text-sm hidden lg:table-cell">
                      {new Date(receipt.paymentDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
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
                          href={`/admin/receipts/${receipt.id}`}
                          className="p-2 text-concrete-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="p-2 text-concrete-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReceipts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-concrete-500">No receipts found</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

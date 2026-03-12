// Admin Finances Page - Track all payments with Excel export
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  FiDownload,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiLoader,
  FiTrendingUp,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";
import { formatCurrency } from "@/utils/formatCurrency";

export default function FinancesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    try {
      const res = await fetch("/api/finances");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching finances:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!data) return;
    setExporting(true);

    try {
      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default || xlsxModule;
      const wb = XLSX.utils.book_new();

      const pound = (v) => "\u00A3" + (v || 0).toFixed(2);
      const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "-";

      // â”€â”€â”€ SHEET 1: DASHBOARD SUMMARY â”€â”€â”€
      const summaryData = [
        ["PUBBLE PLASTERING"],
        ["Financial Report"],
        [`Generated: ${new Date().toLocaleDateString("en-GB")}`],
        [],
        [],
        ["REVENUE OVERVIEW"],
        [],
        ["", "Amount"],
        ["Total Invoiced (inc. VAT)", pound(data.summary.totalInvoiced)],
        ["Total Subtotal (exc. VAT)", pound(data.summary.totalSubtotal)],
        ["Total VAT Collected", pound(data.summary.totalVAT)],
        ["Total Received", pound(data.summary.totalReceived)],
        ["Outstanding Balance", pound(data.summary.outstanding)],
        [],
        [],
        ["INVOICE BREAKDOWN"],
        [],
        ["", "Count"],
        ["Total Invoices", data.summary.totalInvoices || 0],
        ["Paid", data.summary.paidInvoices || 0],
        ["Pending (Draft/Sent)", data.summary.pendingInvoices || 0],
        ["Overdue", data.summary.overdueInvoices || 0],
        ["Average Invoice Value", pound(data.summary.avgInvoiceValue)],
        [],
        [],
        ["PAYMENTS & CLIENTS"],
        [],
        ["", "Count"],
        ["Total Receipts", data.summary.totalReceipts || 0],
        ["Total Clients", data.summary.totalClients || 0],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet["!cols"] = [{ wch: 32 }, { wch: 20 }];
      // Merge title cells
      summarySheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      ];
      XLSX.utils.book_append_sheet(wb, summarySheet, "Dashboard");

      // â”€â”€â”€ SHEET 2: INVOICES â”€â”€â”€
      const invoiceHeader = [
        ["INVOICES"],
        [],
        ["Invoice #", "Client", "Project", "Status", "Issue Date", "Due Date", "Subtotal", "VAT %", "VAT", "Total", "Paid Date"],
      ];
      const invoiceData = (data.invoices || []).map((inv) => [
        inv.invoiceNumber || "",
        inv.client?.name || "-",
        inv.project?.title || "-",
        inv.status || "",
        fmtDate(inv.issueDate),
        fmtDate(inv.dueDate),
        pound(inv.subtotal),
        inv.vatRate || 0,
        pound(inv.vatAmount),
        pound(inv.total),
        fmtDate(inv.paidAt),
      ]);
      // Totals row
      const invSubtotalSum = (data.invoices || []).reduce((s, i) => s + (i.subtotal || 0), 0);
      const invVatSum = (data.invoices || []).reduce((s, i) => s + (i.vatAmount || 0), 0);
      const invTotalSum = (data.invoices || []).reduce((s, i) => s + (i.total || 0), 0);
      invoiceData.push([]);
      invoiceData.push(["", "", "", "", "", "TOTALS:", pound(invSubtotalSum), "", pound(invVatSum), pound(invTotalSum), ""]);

      const invoiceSheet = XLSX.utils.aoa_to_sheet([...invoiceHeader, ...invoiceData]);
      invoiceSheet["!cols"] = [
        { wch: 18 }, { wch: 24 }, { wch: 24 }, { wch: 12 },
        { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 8 },
        { wch: 14 }, { wch: 14 }, { wch: 14 },
      ];
      invoiceSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
      XLSX.utils.book_append_sheet(wb, invoiceSheet, "Invoices");

      // â”€â”€â”€ SHEET 3: LINE ITEMS â”€â”€â”€
      const itemHeader = [
        ["INVOICE LINE ITEMS"],
        [],
        ["Invoice #", "Client", "Description", "Qty", "Unit Price", "Line Total"],
      ];
      const itemData = [];
      (data.invoices || []).forEach((inv) => {
        if (inv.items && inv.items.length > 0) {
          inv.items.forEach((item) => {
            itemData.push([
              inv.invoiceNumber || "",
              inv.client?.name || "-",
              item.description || "",
              item.quantity || 0,
              pound(item.unitPrice),
              pound(item.total),
            ]);
          });
          // Blank row between invoices for readability
          itemData.push([]);
        }
      });
      if (itemData.length === 0) {
        itemData.push(["No line items yet", "", "", "", "", ""]);
      }
      const itemsSheet = XLSX.utils.aoa_to_sheet([...itemHeader, ...itemData]);
      itemsSheet["!cols"] = [
        { wch: 18 }, { wch: 24 }, { wch: 48 },
        { wch: 8 }, { wch: 14 }, { wch: 14 },
      ];
      itemsSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
      XLSX.utils.book_append_sheet(wb, itemsSheet, "Line Items");

      // â”€â”€â”€ SHEET 4: PAYMENTS / RECEIPTS â”€â”€â”€
      const receiptHeader = [
        ["PAYMENT RECEIPTS"],
        [],
        ["Receipt #", "Client", "Project", "Linked Invoice", "Amount", "Method", "Date", "Reference", "Notes"],
      ];
      const receiptData = (data.receipts || []).map((rec) => [
        rec.receiptNumber || "",
        rec.client?.name || "-",
        rec.project?.title || "-",
        rec.invoice?.invoiceNumber || "-",
        pound(rec.amount),
        rec.paymentMethod || "",
        fmtDate(rec.paymentDate),
        rec.reference || "-",
        rec.notes || "",
      ]);
      // Totals row
      const recTotalSum = (data.receipts || []).reduce((s, r) => s + (r.amount || 0), 0);
      receiptData.push([]);
      receiptData.push(["", "", "", "TOTAL RECEIVED:", pound(recTotalSum), "", "", "", ""]);

      if (receiptData.length <= 2) {
        receiptData.splice(0, receiptData.length, ["No receipts yet", "", "", "", "", "", "", "", ""]);
      }
      const receiptSheet = XLSX.utils.aoa_to_sheet([...receiptHeader, ...receiptData]);
      receiptSheet["!cols"] = [
        { wch: 18 }, { wch: 24 }, { wch: 24 }, { wch: 18 },
        { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 30 },
      ];
      receiptSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
      XLSX.utils.book_append_sheet(wb, receiptSheet, "Payments");

      // â”€â”€â”€ SHEET 5: CLIENT DIRECTORY â”€â”€â”€
      const clientHeader = [
        ["CLIENT DIRECTORY"],
        [],
        ["Name", "Email", "Phone", "Address", "City", "Postcode", "Invoices", "Receipts", "Projects"],
      ];
      const clientData = (data.clients || []).map((c) => [
        c.name || "",
        c.email || "-",
        c.phone || c.mobile || "-",
        c.address || "-",
        c.city || "-",
        c.postcode || "-",
        c._count?.invoices || 0,
        c._count?.receipts || 0,
        c._count?.projects || 0,
      ]);
      if (clientData.length === 0) {
        clientData.push(["No clients yet", "", "", "", "", "", "", "", ""]);
      }
      const clientSheet = XLSX.utils.aoa_to_sheet([...clientHeader, ...clientData]);
      clientSheet["!cols"] = [
        { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 32 },
        { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      ];
      clientSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
      XLSX.utils.book_append_sheet(wb, clientSheet, "Clients");

      // Download
      const fileName = `Pubble_Plastering_Finances_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting to Excel: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>
            Finances | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Finances">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  const summary = data?.summary || {};

  return (
    <>
      <Head>
        <title>
          Finances | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Finances">
        {/* Header with Export Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-lg text-concrete-600">
              Financial overview and payment tracking
            </h2>
          </div>
          <button
            onClick={exportToExcel}
            disabled={exporting || !data}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg hover:shadow-xl"
          >
            {exporting ? (
              <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
              <FiDownload className="w-5 h-5" />
            )}
            {exporting ? "Exporting..." : "Export to Excel"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-concrete-500 font-medium">
                  Total Invoiced
                </p>
                <p className="text-2xl font-bold text-concrete-800 mt-1">
                  {formatCurrency(summary.totalInvoiced || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-concrete-500 font-medium">
                  Total Received
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary.totalReceived || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-concrete-500 font-medium">
                  Outstanding
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {formatCurrency(summary.outstanding || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <FiClock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-concrete-500 font-medium">
                  Profit Margin
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {summary.totalInvoiced
                    ? ((summary.totalReceived / summary.totalInvoiced) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status Breakdown */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-concrete-800">
                {summary.paidInvoices || 0}
              </p>
              <p className="text-sm text-concrete-500">Paid Invoices</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-concrete-800">
                {summary.pendingInvoices || 0}
              </p>
              <p className="text-sm text-concrete-500">Pending Invoices</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-concrete-800">
                {summary.overdueInvoices || 0}
              </p>
              <p className="text-sm text-concrete-500">Overdue Invoices</p>
            </div>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-concrete-200">
            <h3 className="font-heading font-bold text-concrete-800">
              All Invoices ({data?.invoices?.length || 0})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-concrete-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-concrete-600 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {data?.invoices?.map((inv) => {
                  const statusColors = {
                    DRAFT: "bg-concrete-100 text-concrete-600",
                    SENT: "bg-blue-100 text-blue-600",
                    VIEWED: "bg-purple-100 text-purple-600",
                    PAID: "bg-green-100 text-green-600",
                    OVERDUE: "bg-red-100 text-red-600",
                    CANCELLED: "bg-concrete-100 text-concrete-500",
                  };
                  return (
                    <tr key={inv.id} className="hover:bg-concrete-50">
                      <td className="px-6 py-4 font-medium text-concrete-800">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-concrete-600">
                        {inv.client?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[inv.status] || "bg-concrete-100 text-concrete-600"}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-concrete-600">
                        {inv.issueDate
                          ? new Date(inv.issueDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-concrete-800">
                        {formatCurrency(inv.total)}
                      </td>
                    </tr>
                  );
                })}
                {(!data?.invoices || data.invoices.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-concrete-500"
                    >
                      No invoices yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-concrete-200">
            <h3 className="font-heading font-bold text-concrete-800">
              All Payments ({data?.receipts?.length || 0})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-concrete-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Receipt #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-concrete-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-concrete-600 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {data?.receipts?.map((rec) => (
                  <tr key={rec.id} className="hover:bg-concrete-50">
                    <td className="px-6 py-4 font-medium text-concrete-800">
                      {rec.receiptNumber}
                    </td>
                    <td className="px-6 py-4 text-concrete-600">
                      {rec.client?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-concrete-600">
                      {rec.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-concrete-600">
                      {rec.paymentDate
                        ? new Date(rec.paymentDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {formatCurrency(rec.amount)}
                    </td>
                  </tr>
                ))}
                {(!data?.receipts || data.receipts.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-concrete-500"
                    >
                      No payments yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}


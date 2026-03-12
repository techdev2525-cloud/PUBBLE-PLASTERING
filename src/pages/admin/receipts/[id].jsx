// Admin Edit Receipt Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft, FiLoader, FiPrinter, FiDownload } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import ReceiptForm from "@/components/admin/ReceiptForm";
import { generateReceiptPDF } from "@/services/pdfGenerator";
import { siteSettings } from "@/config/siteSettings";

export default function EditReceiptPage() {
  const router = useRouter();
  const { id } = router.query;
  const [receipt, setReceipt] = useState(null);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [receiptRes, clientsRes, invoicesRes, projectsRes] =
        await Promise.all([
          fetch(`/api/receipts/${id}`),
          fetch("/api/clients?limit=100"),
          fetch("/api/invoices?limit=100"),
          fetch("/api/projects?limit=100"),
        ]);

      if (!receiptRes.ok) throw new Error("Receipt not found");
      const receiptData = await receiptRes.json();
      setReceipt(receiptData);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }
    } catch (err) {
      alert("Error loading receipt: " + err.message);
      router.push("/admin/receipts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update receipt");
      }

      router.push("/admin/receipts");
    } catch (err) {
      alert("Error updating receipt: " + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>
            Edit Receipt | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Edit Receipt">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  if (!receipt) return null;

  return (
    <>
      <Head>
        <title>
          Edit Receipt | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title={`Edit Receipt ${receipt.receiptNumber}`}>
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/receipts"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Receipts
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const doc = await generateReceiptPDF(receipt);
                doc.autoPrint();
                window.open(doc.output('bloburl'), '_blank');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-concrete-100 text-concrete-700 font-medium rounded-lg hover:bg-concrete-200 transition-colors"
            >
              <FiPrinter className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={async () => {
                const doc = await generateReceiptPDF(receipt);
                doc.save(`${receipt.receiptNumber}.pdf`);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ReceiptForm
              receipt={receipt}
              clients={clients}
              invoices={invoices}
              projects={projects}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

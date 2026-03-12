// Admin Edit Invoice Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft, FiLoader, FiPrinter, FiDownload } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import InvoiceForm from "@/components/admin/InvoiceForm";
import { generateInvoicePDF } from "@/services/pdfGenerator";
import { siteSettings } from "@/config/siteSettings";

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState(null);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [invoiceRes, clientsRes, projectsRes] = await Promise.all([
        fetch(`/api/invoices/${id}`),
        fetch("/api/clients?limit=100"),
        fetch("/api/projects?limit=100"),
      ]);

      if (!invoiceRes.ok) throw new Error("Invoice not found");
      const invoiceData = await invoiceRes.json();
      setInvoice(invoiceData);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }
    } catch (err) {
      alert("Error loading invoice: " + err.message);
      router.push("/admin/invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update invoice");
      }

      router.push("/admin/invoices");
    } catch (err) {
      alert("Error updating invoice: " + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>
            Edit Invoice | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Edit Invoice">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  if (!invoice) return null;

  return (
    <>
      <Head>
        <title>
          Edit Invoice | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title={`Edit Invoice ${invoice.invoiceNumber}`}>
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const doc = await generateInvoicePDF(invoice);
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
                const doc = await generateInvoicePDF(invoice);
                doc.save(`${invoice.invoiceNumber}.pdf`);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <InvoiceForm
              invoice={invoice}
              clients={clients}
              projects={projects}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

// Admin New Receipt Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import ReceiptForm from "@/components/admin/ReceiptForm";
import { siteSettings } from "@/config/siteSettings";

export default function NewReceiptPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [clientsRes, invoicesRes, projectsRes] = await Promise.all([
        fetch("/api/clients?limit=100"),
        fetch("/api/invoices?limit=100"),
        fetch("/api/projects?limit=100"),
      ]);

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
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      console.log("Submitting receipt data:", data);
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.details || result.error || "Failed to create receipt",
        );
      }

      router.push("/admin/receipts");
    } catch (err) {
      console.error("Receipt creation error:", err);
      alert("Error creating receipt: " + err.message);
    }
  };

  if (loading || status === "loading") {
    return (
      <>
        <Head>
          <title>
            New Receipt | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="New Receipt">
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
          New Receipt | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="New Receipt">
        <div className="mb-6">
          <Link
            href="/admin/receipts"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Receipts
          </Link>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ReceiptForm
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

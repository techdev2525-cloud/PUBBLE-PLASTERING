// Admin New Invoice Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import InvoiceForm from "@/components/admin/InvoiceForm";
import { siteSettings } from "@/config/siteSettings";

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [clients, setClients] = useState([]);
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
      const [clientsRes, projectsRes] = await Promise.all([
        fetch("/api/clients?limit=100"),
        fetch("/api/projects?limit=100"),
      ]);

      if (!clientsRes.ok || !projectsRes.ok) {
        console.error("API response not OK:", {
          clients: clientsRes.status,
          projects: projectsRes.status,
        });
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
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
      console.log("Submitting invoice data:", data);
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.details || result.error || "Failed to create invoice",
        );
      }

      router.push("/admin/invoices");
    } catch (err) {
      console.error("Invoice creation error:", err);
      alert("Error creating invoice: " + err.message);
    }
  };

  if (loading || status === "loading") {
    return (
      <>
        <Head>
          <title>
            New Invoice | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="New Invoice">
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
          New Invoice | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="New Invoice">
        <div className="mb-6">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
        </div>

        <div className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <InvoiceForm
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

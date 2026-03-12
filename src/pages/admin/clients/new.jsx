// Admin New/Edit Client Page
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import ClientForm from "@/components/admin/ClientForm";
import { siteSettings } from "@/config/siteSettings";

export default function NewClientPage() {
  const router = useRouter();

  const handleSubmit = async (data) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create client");
      }

      router.push("/admin/clients");
    } catch (err) {
      alert("Error creating client: " + err.message);
    }
  };

  return (
    <>
      <Head>
        <title>
          New Client | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="New Client">
        <div className="mb-6">
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Clients
          </Link>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ClientForm onSubmit={handleSubmit} />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

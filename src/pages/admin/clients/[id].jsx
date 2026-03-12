// Admin Edit Client Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import ClientForm from "@/components/admin/ClientForm";
import { siteSettings } from "@/config/siteSettings";

export default function EditClientPage() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error("Client not found");
      const data = await res.json();
      setClient(data);
    } catch (err) {
      alert("Error loading client: " + err.message);
      router.push("/admin/clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update client");
      }

      router.push("/admin/clients");
    } catch (err) {
      alert("Error updating client: " + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>
            Edit Client | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Edit Client">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  if (!client) return null;

  return (
    <>
      <Head>
        <title>
          Edit {client.name} | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title={`Edit Client`}>
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
            <ClientForm client={client} onSubmit={handleSubmit} />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

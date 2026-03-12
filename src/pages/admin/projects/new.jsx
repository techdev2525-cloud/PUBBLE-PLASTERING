// Admin New Project Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import ProjectForm from "@/components/admin/ProjectForm";
import { siteSettings } from "@/config/siteSettings";

export default function NewProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients?limit=100");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create project");
      }

      const project = await res.json();
      router.push("/admin/projects/" + project.id);
    } catch (err) {
      alert("Error creating project: " + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>
            New Project | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="New Project">
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
          New Project | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="New Project">
        <div className="mb-6">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>

        <div className="max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ProjectForm clients={clients} onSubmit={handleSubmit} />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

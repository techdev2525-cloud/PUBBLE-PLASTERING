// Admin Edit Project Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import ProjectForm from "@/components/admin/ProjectForm";
import { siteSettings } from "@/config/siteSettings";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, clientsRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch("/api/clients?limit=100"),
      ]);

      if (!projectRes.ok) throw new Error("Project not found");
      const projectData = await projectRes.json();
      setProject(projectData);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }
    } catch (err) {
      alert("Error loading project: " + err.message);
      router.push("/admin/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update project");
      }

      router.push("/admin/projects");
    } catch (err) {
      alert("Error updating project: " + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>
            Edit Project | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Edit Project">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  if (!project) return null;

  return (
    <>
      <Head>
        <title>
          Edit Project | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Edit Project">
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
            <ProjectForm
              project={project}
              clients={clients}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

// Admin Projects List Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiLoader,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "PLANNING", label: "Planning" },
  { value: "QUOTED", label: "Quoted" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const getStatusBadge = (status) => {
  const styles = {
    PLANNING: "bg-purple-100 text-purple-700",
    QUOTED: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-primary-100 text-primary-700",
    ON_HOLD: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-concrete-100 text-concrete-700";
};

const getStatusLabel = (status) => {
  return (status || "")
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function ProjectsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/projects?${params}`);
      if (!res.ok) throw new Error("Failed to fetch projects");

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const filteredProjects = projects;

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete project");
        fetchProjects();
      } catch (err) {
        alert("Error deleting project: " + err.message);
      }
    }
  };

  if (loading && projects.length === 0) {
    return (
      <>
        <Head>
          <title>
            Projects | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Projects">
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
          Projects | Admin - {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Projects">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-concrete-100 relative">
                {project.images?.[0]?.url ? (
                  <img
                    src={project.images[0].url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-concrete-400">
                    No Image
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-concrete-800 mb-1">
                  {project.title}
                </h3>
                <p className="text-sm text-concrete-500 mb-3">
                  {project.client?.name || "No client assigned"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-concrete-500 capitalize">
                    {project.category || "Uncategorized"}
                  </span>
                  {project.value && (
                    <span className="font-semibold text-concrete-800">
                      £{project.value.toLocaleString()}
                    </span>
                  )}
                </div>
                {project.startDate && (
                  <p className="text-xs text-concrete-400 mt-2">
                    {new Date(project.startDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="px-4 py-3 border-t border-concrete-100 flex items-center justify-end gap-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="p-2 text-concrete-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View"
                >
                  <FiEye className="w-5 h-5" />
                </Link>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="p-2 text-concrete-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FiEdit2 className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-concrete-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-concrete-500">No projects found</p>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 font-medium hover:underline"
            >
              <FiPlus className="w-4 h-4" />
              Create your first project
            </Link>
          </div>
        )}
      </AdminLayout>
    </>
  );
}

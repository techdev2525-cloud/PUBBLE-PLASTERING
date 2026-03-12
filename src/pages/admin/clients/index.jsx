// Admin Clients List Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiLoader,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

export default function ClientsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Fetch clients from API
  const fetchClients = async (search = "", page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.append("search", search);

      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error("Failed to fetch clients");

      const data = await res.json();
      setClients(data.clients || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(searchQuery, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredClients = clients;

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete client");
        fetchClients(searchQuery, pagination.page);
      } catch (err) {
        alert("Error deleting client: " + err.message);
      }
    }
  };

  if (loading && clients.length === 0) {
    return (
      <>
        <Head>
          <title>
            Clients | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Clients">
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
          Clients | Admin - {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Clients">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Add Client
          </Link>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-concrete-50 border-b border-concrete-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden md:table-cell">
                    Contact
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden lg:table-cell">
                    Projects
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden lg:table-cell">
                    Location
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-concrete-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-concrete-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="font-medium text-concrete-800 hover:text-primary-600"
                        >
                          {client.name}
                        </Link>
                        {client.city && (
                          <p className="text-sm text-concrete-500 flex items-center gap-1 mt-1">
                            <FiMapPin className="w-3 h-3" />
                            {client.city}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="text-sm text-concrete-600 flex items-center gap-2">
                          <FiMail className="w-4 h-4 text-concrete-400" />
                          {client.email}
                        </p>
                        {client.phone && (
                          <p className="text-sm text-concrete-600 flex items-center gap-2">
                            <FiPhone className="w-4 h-4 text-concrete-400" />
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-concrete-700">
                        {client._count?.projects || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-concrete-600">
                        {client.postcode || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="p-2 text-concrete-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-concrete-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-concrete-500">No clients found</p>
              <Link
                href="/admin/clients/new"
                className="inline-flex items-center gap-2 mt-4 text-primary-600 font-medium hover:underline"
              >
                <FiPlus className="w-4 h-4" />
                Add your first client
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-concrete-500">
            Showing {filteredClients.length} of {pagination.total} clients
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-concrete-500 hover:text-concrete-700 disabled:opacity-50"
              disabled={pagination.page <= 1}
              onClick={() => fetchClients(searchQuery, pagination.page - 1)}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-concrete-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="px-4 py-2 text-concrete-500 hover:text-concrete-700 disabled:opacity-50"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchClients(searchQuery, pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

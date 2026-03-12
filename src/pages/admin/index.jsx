// Admin Dashboard Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FiUsers,
  FiFolder,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiMail,
  FiEdit3,
  FiLoader,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

const getStatusColor = (status) => {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "QUOTED":
    case "QUOTE":
      return "bg-orange-100 text-orange-700";
    case "PLANNING":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-concrete-100 text-concrete-700";
  }
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.ok ? res.json() : Promise.reject("Failed"))
      .then(setData)
      .catch((err) => console.error("Dashboard load error:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const recentProjects = data?.recentProjects || [];
  const recentQuotes = data?.recentQuotes || [];

  const statsCards = [
    {
      title: "Active Projects",
      value: String(stats.activeProjects ?? 0),
      change: `${stats.totalClients ?? 0} total clients`,
      icon: FiFolder,
      color: "bg-blue-500",
      href: "/admin/projects",
    },
    {
      title: "Total Clients",
      value: String(stats.totalClients ?? 0),
      change: `+${stats.newClientsThisMonth ?? 0} this month`,
      icon: FiUsers,
      color: "bg-green-500",
      href: "/admin/clients",
    },
    {
      title: "Pending Invoices",
      value: `\u00a3${(stats.pendingInvoiceTotal ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`,
      change: `${stats.pendingInvoices ?? 0} invoices`,
      icon: FiFileText,
      color: "bg-orange-500",
      href: "/admin/invoices",
    },
    {
      title: "Revenue (MTD)",
      value: `\u00a3${(stats.revenueThisMonth ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`,
      change: "This month",
      icon: FiDollarSign,
      color: "bg-purple-500",
      href: "/admin/invoices",
    },
  ];
  return (
    <>
      <Head>
        <title>
          Dashboard | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Dashboard">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
        <>
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <FiArrowRight className="w-5 h-5 text-concrete-300 group-hover:text-primary-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-concrete-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-concrete-500 text-sm mb-1">{stat.title}</p>
              <p className="text-xs text-green-600">{stat.change}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-concrete-100">
              <h2 className="font-heading font-bold text-lg text-concrete-800">
                Recent Projects
              </h2>
              <Link
                href="/admin/projects"
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-concrete-100">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 hover:bg-concrete-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-concrete-100 rounded-lg flex items-center justify-center">
                      <FiFolder className="w-5 h-5 text-concrete-500" />
                    </div>
                    <div>
                      <p className="font-medium text-concrete-800">
                        {project.title}
                      </p>
                      <p className="text-sm text-concrete-500">
                        {project.client?.name || "No client"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                    <span className="text-sm text-concrete-400 hidden sm:block">
                      {new Date(project.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Requests */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-concrete-100">
              <h2 className="font-heading font-bold text-lg text-concrete-800">
                Quote Requests
              </h2>
              <Link
                href="/admin/quote-requests"
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-concrete-100">
              {recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-4 hover:bg-concrete-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-concrete-800">
                      {quote.name}
                    </p>
                    {quote.status === "NEW" && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-concrete-500 mb-2">
                    {quote.service}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-concrete-400">
                    <FiClock className="w-3 h-3" />
                    {new Date(quote.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-concrete-100">
              <Link
                href="/admin/quote-requests"
                className="flex items-center justify-center gap-2 w-full py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors"
              >
                <FiMail className="w-4 h-4" />
                View All Requests
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/clients/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium text-concrete-700">Add Client</span>
          </Link>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiFolder className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium text-concrete-700">New Project</span>
          </Link>
          <Link
            href="/admin/invoices/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-medium text-concrete-700">
              Create Invoice
            </span>
          </Link>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiEdit3 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium text-concrete-700">
              Write Blog Post
            </span>
          </Link>
        </div>
        </>
        )}
      </AdminLayout>
    </>
  );
}

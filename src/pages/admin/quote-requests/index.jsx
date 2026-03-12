// Admin Quote Requests Page - Fully Functional
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiCheck,
  FiX,
  FiClock,
  FiArrowRight,
  FiMessageSquare,
  FiLoader,
  FiTrash2,
  FiUserPlus,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiImage,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

const statusConfig = {
  NEW: {
    label: "New",
    color: "bg-primary-100 text-primary-700",
    icon: FiClock,
  },
  CONTACTED: {
    label: "Contacted",
    color: "bg-blue-100 text-blue-700",
    icon: FiPhone,
  },
  QUOTED: {
    label: "Quoted",
    color: "bg-yellow-100 text-yellow-700",
    icon: FiMail,
  },
  CONVERTED: {
    label: "Converted",
    color: "bg-green-100 text-green-700",
    icon: FiCheck,
  },
  DECLINED: {
    label: "Declined",
    color: "bg-concrete-100 text-concrete-500",
    icon: FiX,
  },
};

const budgetLabels = {
  under500: "Under \u00a3500",
  "500-1000": "\u00a3500 - \u00a31,000",
  "1000-2500": "\u00a31,000 - \u00a32,500",
  "2500-5000": "\u00a32,500 - \u00a35,000",
  over5000: "Over \u00a35,000",
  unsure: "Not sure",
};

const timelineLabels = {
  asap: "ASAP",
  "1-2weeks": "1-2 Weeks",
  "1month": "Within a Month",
  flexible: "Flexible",
};

export default function QuoteRequestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [converting, setConverting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/quotes?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching quote requests:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter((request) => {
    const q = searchQuery.toLowerCase();
    return (
      (request.name || "").toLowerCase().includes(q) ||
      (request.email || "").toLowerCase().includes(q) ||
      (request.service || "").toLowerCase().includes(q) ||
      (request.address || "").toLowerCase().includes(q) ||
      (request.postcode || "").toLowerCase().includes(q)
    );
  });

  const selectRequest = (req) => {
    setSelectedRequest(req);
    setNotes(req.notes || "");
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setSelectedRequest(updated);
      fetchRequests();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const saveNotes = async () => {
    if (!selectedRequest) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/quotes/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      const updated = await res.json();
      setSelectedRequest(updated);
      fetchRequests();
    } catch (err) {
      alert("Error saving notes: " + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const convertToClient = async () => {
    if (!selectedRequest) return;
    if (!confirm(`Convert "${selectedRequest.name}" to a client?`)) return;
    setConverting(true);
    try {
      // Create client from quote data
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedRequest.name,
          email: selectedRequest.email,
          phone: selectedRequest.phone || "",
          address: selectedRequest.address || "",
          postcode: selectedRequest.postcode || "",
          notes: `Converted from quote request. Service: ${selectedRequest.service || "N/A"}. ${selectedRequest.message || ""}`.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create client");
      }
      // Mark quote as CONVERTED
      await updateStatus(selectedRequest.id, "CONVERTED");
      alert("Client created successfully! You can find them in the Clients section.");
    } catch (err) {
      alert("Error converting to client: " + err.message);
    } finally {
      setConverting(false);
    }
  };

  const deleteRequest = async () => {
    if (!selectedRequest) return;
    if (!confirm(`Delete quote request from "${selectedRequest.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotes/${selectedRequest.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      alert("Error deleting: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getImages = (request) => {
    if (!request.images) return [];
    try {
      return JSON.parse(request.images);
    } catch {
      return [];
    }
  };

  const newCount = requests.filter((r) => r.status === "NEW").length;

  if (loading && requests.length === 0) {
    return (
      <>
        <Head>
          <title>Quote Requests | Admin - {siteSettings.company?.name || "Pubble Plastering"}</title>
        </Head>
        <AdminLayout title="Quote Requests">
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
        <title>Quote Requests ({requests.length}) | Admin - {siteSettings.company?.name || "Pubble Plastering"}</title>
      </Head>

      <AdminLayout title="Quote Requests">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = requests.filter((r) => r.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                className={`p-3 rounded-xl text-center transition-all ${
                  statusFilter === key ? "ring-2 ring-primary-500 shadow-md" : ""
                } ${config.color}`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-medium">{config.label}</div>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* List Panel */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, service..."
                  className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <button
                onClick={fetchRequests}
                className="p-2 border border-concrete-200 rounded-lg hover:bg-concrete-50"
                title="Refresh"
              >
                <FiRefreshCw className={`w-5 h-5 text-concrete-500 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {["all", "NEW", "CONTACTED", "QUOTED", "CONVERTED", "DECLINED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? "bg-primary-600 text-white"
                      : "bg-white text-concrete-600 hover:bg-concrete-100"
                  }`}
                >
                  {status === "all" ? "All" : statusConfig[status]?.label}
                  {status === "NEW" && newCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {newCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Request List */}
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-concrete-400">
                  {searchQuery ? "No matching requests" : "No quote requests yet"}
                </div>
              ) : (
                filteredRequests.map((request) => {
                  const status = statusConfig[request.status] || statusConfig.NEW;
                  const isSelected = selectedRequest?.id === request.id;
                  return (
                    <button
                      key={request.id}
                      onClick={() => selectRequest(request)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        isSelected
                          ? "bg-primary-50 ring-2 ring-primary-500"
                          : "bg-white hover:bg-concrete-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-concrete-800 truncate">
                            {request.name}
                          </p>
                          <p className="text-sm text-concrete-500 truncate">
                            {request.service || "No service specified"}
                          </p>
                        </div>
                        {request.status === "NEW" && (
                          <span className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className="text-xs text-concrete-400">
                          {new Date(request.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="bg-white rounded-xl shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-concrete-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-heading font-bold text-xl text-concrete-800">
                        {selectedRequest.name}
                      </h2>
                      <p className="text-concrete-500">
                        {selectedRequest.service || "No service specified"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          (statusConfig[selectedRequest.status] || statusConfig.NEW).color
                        }`}
                      >
                        {(statusConfig[selectedRequest.status] || statusConfig.NEW).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact Info */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <a
                      href={`mailto:${selectedRequest.email}`}
                      className="flex items-center gap-3 p-3 bg-concrete-50 rounded-lg hover:bg-concrete-100 transition-colors"
                    >
                      <FiMail className="w-5 h-5 text-primary-500" />
                      <div>
                        <div className="text-xs text-concrete-400">Email</div>
                        <div className="text-concrete-700 text-sm">{selectedRequest.email}</div>
                      </div>
                    </a>
                    {selectedRequest.phone && (
                      <a
                        href={`tel:${selectedRequest.phone}`}
                        className="flex items-center gap-3 p-3 bg-concrete-50 rounded-lg hover:bg-concrete-100 transition-colors"
                      >
                        <FiPhone className="w-5 h-5 text-primary-500" />
                        <div>
                          <div className="text-xs text-concrete-400">Phone</div>
                          <div className="text-concrete-700 text-sm">{selectedRequest.phone}</div>
                        </div>
                      </a>
                    )}
                    {(selectedRequest.address || selectedRequest.postcode) && (
                      <div className="flex items-center gap-3 p-3 bg-concrete-50 rounded-lg">
                        <FiMapPin className="w-5 h-5 text-primary-500" />
                        <div>
                          <div className="text-xs text-concrete-400">Address</div>
                          <div className="text-concrete-700 text-sm">
                            {[selectedRequest.address, selectedRequest.postcode].filter(Boolean).join(", ")}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedRequest.preferredContact && (
                      <div className="flex items-center gap-3 p-3 bg-concrete-50 rounded-lg">
                        <FiMessageSquare className="w-5 h-5 text-primary-500" />
                        <div>
                          <div className="text-xs text-concrete-400">Preferred Contact</div>
                          <div className="text-concrete-700 text-sm capitalize">{selectedRequest.preferredContact}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extra Details */}
                  {(selectedRequest.timeline || selectedRequest.budget) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedRequest.timeline && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <FiCalendar className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="text-xs text-blue-400">Timeline</div>
                            <div className="text-blue-700 text-sm font-medium">
                              {timelineLabels[selectedRequest.timeline] || selectedRequest.timeline}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedRequest.budget && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <FiDollarSign className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="text-xs text-green-400">Budget</div>
                            <div className="text-green-700 text-sm font-medium">
                              {budgetLabels[selectedRequest.budget] || selectedRequest.budget}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <h3 className="font-semibold text-concrete-800 mb-2 flex items-center gap-2">
                      <FiMessageSquare className="w-4 h-4" />
                      Project Description
                    </h3>
                    <p className="text-concrete-600 bg-concrete-50 rounded-lg p-4 whitespace-pre-wrap">
                      {selectedRequest.message}
                    </p>
                  </div>

                  {/* Images */}
                  {getImages(selectedRequest).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-concrete-800 mb-2 flex items-center gap-2">
                        <FiImage className="w-4 h-4" />
                        Uploaded Photos ({getImages(selectedRequest).length})
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {getImages(selectedRequest).map((img, i) => (
                          <a
                            key={i}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg overflow-hidden border border-concrete-200 hover:ring-2 hover:ring-primary-500 transition-all"
                          >
                            <img
                              src={img}
                              alt={`Quote photo ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-sm text-concrete-400">
                    Received:{" "}
                    {new Date(selectedRequest.createdAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`mailto:${selectedRequest.email}?subject=Re: Quote Request - ${encodeURIComponent(selectedRequest.service || "Plastering")}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FiMail className="w-4 h-4" />
                      Send Email
                    </a>
                    {selectedRequest.phone && (
                      <a
                        href={`tel:${selectedRequest.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-concrete-300 text-concrete-700 font-semibold rounded-lg hover:bg-concrete-50 transition-colors"
                      >
                        <FiPhone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                    {selectedRequest.status !== "CONVERTED" && (
                      <button
                        onClick={convertToClient}
                        disabled={converting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <FiUserPlus className="w-4 h-4" />
                        {converting ? "Converting..." : "Convert to Client"}
                      </button>
                    )}
                    <button
                      onClick={deleteRequest}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  {/* Status Update */}
                  <div className="pt-4 border-t border-concrete-100">
                    <h3 className="font-semibold text-concrete-800 mb-3">
                      Update Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => updateStatus(selectedRequest.id, key)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedRequest.status === key
                              ? config.color + " ring-2 ring-offset-1 ring-current"
                              : "bg-concrete-100 text-concrete-500 hover:bg-concrete-200"
                          }`}
                        >
                          <config.icon className="w-3 h-3" />
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="pt-4 border-t border-concrete-100">
                    <h3 className="font-semibold text-concrete-800 mb-3">
                      Admin Notes
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="Add internal notes about this quote request..."
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={saveNotes}
                        disabled={savingNotes}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-concrete-800 text-white font-semibold rounded-lg hover:bg-concrete-900 transition-colors disabled:opacity-50 text-sm"
                      >
                        <FiSave className="w-4 h-4" />
                        {savingNotes ? "Saving..." : "Save Notes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FiMail className="w-12 h-12 text-concrete-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-concrete-500 mb-2">
                  {requests.length === 0 ? "No Quote Requests Yet" : "Select a Request"}
                </h3>
                <p className="text-concrete-400 text-sm">
                  {requests.length === 0
                    ? "When customers submit quote requests, they will appear here."
                    : "Click on a quote request from the list to view details."}
                </p>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

// ProjectForm Component - Admin Project Management
"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FiFolder,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiImage,
  FiX,
  FiPlus,
  FiSave,
  FiUploadCloud,
  FiLoader,
} from "react-icons/fi";
import Button from "../common/Button";

const PROJECT_STATUSES = [
  { value: "PLANNING", label: "Planning", color: "bg-blue-100 text-blue-700" },
  { value: "QUOTED", label: "Quoted", color: "bg-purple-100 text-purple-700" },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "ON_HOLD",
    label: "On Hold",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-green-100 text-green-700",
  },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

export default function ProjectForm({
  project = null,
  clients: initialClients = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const [clients, setClients] = useState(initialClients);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
  });
  const [creatingClient, setCreatingClient] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    description: "",
    location: "",
    status: "PLANNING",
    startDate: "",
    estimatedEnd: "",
    value: "",
    actualCost: "",
    notes: "",
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  const handleQuickCreateClient = async () => {
    if (!newClient.name.trim()) return alert("Client name is required");
    if (!newClient.phone.trim()) return alert("Client phone is required");
    setCreatingClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create client");
      }
      const created = await res.json();
      setClients((prev) => [created, ...prev]);
      setFormData((prev) => ({ ...prev, clientId: created.id }));
      // Auto-fill location from new client address
      const parts = [created.address, created.city, created.postcode].filter(
        Boolean,
      );
      if (parts.length > 0 && !formData.location) {
        setFormData((prev) => ({
          ...prev,
          clientId: created.id,
          location: parts.join(", "),
        }));
      }
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postcode: "",
      });
      setShowNewClient(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingClient(false);
    }
  };

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        clientId: project.clientId || "",
        description: project.description || "",
        location: project.location || "",
        status: project.status || "PLANNING",
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        estimatedEnd: project.estimatedEnd
          ? project.estimatedEnd.split("T")[0]
          : "",
        value: project.value || "",
        actualCost: project.actualCost || "",
        notes: project.notes || "",
      });
      if (project.images && project.images.length > 0) {
        setImages(
          project.images.map((img) => ({
            id: img.id,
            url: img.url,
            caption: img.caption || "",
            isExisting: true,
          })),
        );
      }
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Auto-fill location from client address when client is selected
    if (name === "clientId" && value) {
      const selectedClient = clients.find((c) => c.id === value);
      if (selectedClient && !formData.location) {
        const parts = [
          selectedClient.address,
          selectedClient.city,
          selectedClient.postcode,
        ].filter(Boolean);
        if (parts.length > 0) {
          setFormData((prev) => ({
            ...prev,
            clientId: value,
            location: parts.join(", "),
          }));
        }
      }
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "projects");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          if (data.files && data.files.length > 0) {
            setImages((prev) => [
              ...prev,
              { url: data.files[0].url, caption: "", isExisting: false },
            ]);
          }
        }
      }
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.clientId) newErrors.clientId = "Please select a client";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      value: formData.value ? parseFloat(formData.value) : null,
      actualCost: formData.actualCost ? parseFloat(formData.actualCost) : null,
      startDate: formData.startDate || null,
      estimatedEnd: formData.estimatedEnd || null,
      images: images.map((img, i) => ({
        url: img.url,
        caption: img.caption || "",
        order: i,
        id: img.id || undefined,
      })),
    };

    if (onSubmit) {
      await onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Project Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiFolder className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.title ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
              placeholder="Kitchen Plastering - 123 Main St"
            />
          </div>
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.clientId ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company && `(${client.company})`}
                </option>
              ))}
            </select>
          </div>
          {errors.clientId && (
            <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
          )}
          <button
            type="button"
            onClick={() => setShowNewClient(!showNewClient)}
            className="mt-1 text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
          >
            <FiPlus className="w-3 h-3" />
            {showNewClient ? "Cancel" : "Quick add new client"}
          </button>
        </div>
      </div>

      {/* Quick Add Client Inline */}
      {showNewClient && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-concrete-800 text-sm">
            Quick Add Client
          </h4>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Name *"
              value={newClient.name}
              onChange={(e) =>
                setNewClient((p) => ({ ...p, name: e.target.value }))
              }
              className="px-3 py-2 border border-concrete-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) =>
                setNewClient((p) => ({ ...p, email: e.target.value }))
              }
              className="px-3 py-2 border border-concrete-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="tel"
              placeholder="Phone *"
              value={newClient.phone}
              onChange={(e) =>
                setNewClient((p) => ({ ...p, phone: e.target.value }))
              }
              className="px-3 py-2 border border-concrete-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Address"
              value={newClient.address}
              onChange={(e) =>
                setNewClient((p) => ({ ...p, address: e.target.value }))
              }
              className="px-3 py-2 border border-concrete-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="City"
              value={newClient.city}
              onChange={(e) =>
                setNewClient((p) => ({ ...p, city: e.target.value }))
              }
              className="px-3 py-2 border border-concrete-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Postcode"
              value={newClient.postcode}
              onChange={(e) =>
                setNewClient((p) => ({ ...p, postcode: e.target.value }))
              }
              className="px-3 py-2 border border-concrete-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={handleQuickCreateClient}
            disabled={creatingClient}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {creatingClient ? "Creating..." : "Create & Select Client"}
          </button>
        </div>
      )}

      {/* Location & Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Location
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="123 Main Street, City"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="Describe the project scope and requirements..."
        />
      </div>

      {/* Dates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="date"
              name="estimatedEnd"
              value={formData.estimatedEnd}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Estimated Cost (£)
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Actual Cost (£)
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="number"
              name="actualCost"
              value={formData.actualCost}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Project Images
        </label>
        <div className="space-y-4">
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden group border border-concrete-200"
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Project ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-concrete-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-concrete-50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploading ? (
              <>
                <FiLoader className="w-5 h-5 text-primary-500 animate-spin" />
                <span className="text-concrete-600">Uploading...</span>
              </>
            ) : (
              <>
                <FiUploadCloud className="w-5 h-5 text-concrete-400" />
                <span className="text-concrete-600">Click to add images</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Internal Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="Internal notes (not visible to client)..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <FiX className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          <FiSave className="w-4 h-4 mr-2" />
          {project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}

// InvoiceForm Component - Admin Invoice Management
"use client";
import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiUser,
  FiFolder,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiSave,
  FiX,
} from "react-icons/fi";
import Button from "../common/Button";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculateVAT } from "@/utils/calculateVAT";

const INVOICE_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "VIEWED", label: "Viewed" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function InvoiceForm({
  invoice = null,
  clients: initialClients = [],
  projects = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const [clientList, setClientList] = useState(initialClients);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [creatingClient, setCreatingClient] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    projectId: "",
    invoiceNumber: "",
    status: "DRAFT",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    terms: "Payment due within 14 days of invoice date.",
  });

  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const [includeVAT, setIncludeVAT] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setClientList(initialClients);
  }, [initialClients]);

  const handleQuickCreateClient = async () => {
    if (!newClient.name.trim()) return alert("Client name is required");
    setCreatingClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const created = await res.json();
      setClientList((prev) => [created, ...prev]);
      setFormData((prev) => ({ ...prev, clientId: created.id }));
      setNewClient({ name: "", email: "", phone: "" });
      setShowNewClient(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingClient(false);
    }
  };

  useEffect(() => {
    if (invoice) {
      setFormData({
        clientId: invoice.clientId || "",
        projectId: invoice.projectId || "",
        invoiceNumber: invoice.invoiceNumber || "",
        status: invoice.status || "DRAFT",
        issueDate: invoice.issueDate ? invoice.issueDate.split("T")[0] : "",
        dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
        notes: invoice.notes || "",
        terms: invoice.terms || "",
      });
      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items);
      }
      setIncludeVAT(invoice.vatRate > 0);
    }
  }, [invoice]);

  // Set default due date (14 days from issue)
  useEffect(() => {
    if (formData.issueDate && !formData.dueDate) {
      const issueDate = new Date(formData.issueDate);
      issueDate.setDate(issueDate.getDate() + 14);
      setFormData((prev) => ({
        ...prev,
        dueDate: issueDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.issueDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    return (
      sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
    );
  }, 0);

  const vatAmount = includeVAT ? calculateVAT(subtotal) : 0;
  const total = subtotal + vatAmount;

  const validate = () => {
    const newErrors = {};
    if (!formData.clientId) newErrors.clientId = "Please select a client";
    if (items.every((item) => !item.description.trim())) {
      newErrors.items = "Add at least one line item";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Filter out empty items
    const validItems = items.filter(
      (item) => item.description && item.description.trim(),
    );

    if (validItems.length === 0) {
      setErrors({ items: "Add at least one line item with a description" });
      return;
    }

    const submitData = {
      ...formData,
      items: validItems.map((item) => ({
        description: item.description.trim(),
        quantity: parseFloat(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
      })),
      subtotal,
      vatRate: includeVAT ? 20 : 0,
      vatAmount,
      total,
      includeVAT,
    };

    if (onSubmit) {
      await onSubmit(submitData);
    }
  };

  // Filter projects by selected client
  const filteredProjects = formData.clientId
    ? projects.filter((p) => p.clientId === formData.clientId)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Header */}
      <div className="border-b border-concrete-200 pb-4 mb-2">
        <div className="flex items-center justify-between">
          <img
            src="/images/logo/pubble-logo.jpeg"
            alt="Pubble Plastering"
            className="h-16 w-auto object-contain"
          />
          <div className="text-right">
            <h2 className="text-2xl font-heading font-bold text-concrete-800">
              INVOICE
            </h2>
            {formData.invoiceNumber && (
              <p className="text-concrete-500 text-sm">
                {formData.invoiceNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Client & Project */}
      <div className="grid md:grid-cols-2 gap-4">
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
              {clientList.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
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
          {showNewClient && (
            <div className="mt-2 bg-primary-50 border border-primary-200 rounded-lg p-3 space-y-2">
              <input type="text" placeholder="Name *" value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-1.5 border border-concrete-300 rounded text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="email" placeholder="Email" value={newClient.email} onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))} className="px-3 py-1.5 border border-concrete-300 rounded text-sm" />
                <input type="tel" placeholder="Phone" value={newClient.phone} onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))} className="px-3 py-1.5 border border-concrete-300 rounded text-sm" />
              </div>
              <button type="button" onClick={handleQuickCreateClient} disabled={creatingClient} className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50">
                {creatingClient ? "Creating..." : "Create & Select"}
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Project (Optional)
          </label>
          <div className="relative">
            <FiFolder className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={!formData.clientId}
            >
              <option value="">No project linked</option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Invoice Number
          </label>
          <div className="relative">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Auto-generated"
              disabled={!!invoice}
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
            {INVOICE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-concrete-700 mb-1">
            Include VAT (20%)
          </label>
          <button
            type="button"
            onClick={() => setIncludeVAT(!includeVAT)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              includeVAT ? "bg-primary-500" : "bg-concrete-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                includeVAT ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Issue Date
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Due Date
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-2">
          Line Items
        </label>
        <div className="bg-concrete-50 rounded-lg p-4 space-y-3">
          {/* Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-medium text-concrete-600 px-2">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Items */}
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="grid md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Item description"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-center"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-right"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between">
                  <span className="font-medium text-concrete-800">
                    {formatCurrency(
                      (item.quantity || 0) * (item.unitPrice || 0),
                    )}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Add Line Item
          </button>

          {errors.items && (
            <p className="text-red-500 text-sm">{errors.items}</p>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-concrete-50 rounded-lg p-4">
        <div className="max-w-xs ml-auto space-y-2">
          <div className="flex justify-between text-concrete-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {includeVAT && (
            <div className="flex justify-between text-concrete-600">
              <span>VAT (20%):</span>
              <span>{formatCurrency(vatAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-concrete-800 pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Additional notes for the client..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Payment Terms
          </label>
          <textarea
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Payment terms..."
          />
        </div>
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
          {invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}

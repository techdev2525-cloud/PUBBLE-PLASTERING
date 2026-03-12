// ReceiptForm Component - Admin Receipt Management
"use client";
import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiUser,
  FiFolder,
  FiCalendar,
  FiCreditCard,
  FiSave,
  FiX,
  FiMail,
  FiDownload,
} from "react-icons/fi";
import Button from "../common/Button";
import { formatCurrency } from "@/utils/formatCurrency";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Card Payment" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" },
];

export default function ReceiptForm({
  receipt = null,
  invoice = null,
  clients = [],
  invoices = [],
  projects = [],
  onSubmit,
  onCancel,
  onSendEmail,
  onDownloadPDF,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    clientId: "",
    invoiceId: "",
    projectId: "",
    receiptNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "BANK_TRANSFER",
    amount: "",
    reference: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (receipt) {
      setFormData({
        clientId: receipt.clientId || "",
        invoiceId: receipt.invoiceId || "",
        projectId: receipt.projectId || "",
        receiptNumber: receipt.receiptNumber || "",
        paymentDate: receipt.paymentDate
          ? receipt.paymentDate.split("T")[0]
          : "",
        paymentMethod: receipt.paymentMethod || "BANK_TRANSFER",
        amount: receipt.amount || "",
        reference: receipt.reference || "",
        notes: receipt.notes || "",
      });
    } else if (invoice) {
      // Pre-fill from invoice
      setFormData((prev) => ({
        ...prev,
        clientId: invoice.clientId || "",
        invoiceId: invoice.id || "",
        projectId: invoice.projectId || "",
        amount: invoice.total || "",
      }));
    }
  }, [receipt, invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Auto-fill amount from selected invoice
  const handleInvoiceSelect = (e) => {
    const invoiceId = e.target.value;
    setFormData((prev) => ({ ...prev, invoiceId }));

    if (invoiceId) {
      const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);
      if (selectedInvoice) {
        setFormData((prev) => ({
          ...prev,
          amount: selectedInvoice.total,
          clientId: selectedInvoice.clientId,
          projectId: selectedInvoice.projectId || "",
        }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clientId) newErrors.clientId = "Please select a client";
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    if (!formData.paymentDate)
      newErrors.paymentDate = "Payment date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (onSubmit) {
      await onSubmit(submitData);
    }
  };

  // Filter invoices by selected client (show unpaid + currently linked)
  const filteredInvoices = formData.clientId
    ? invoices.filter(
        (inv) =>
          inv.clientId === formData.clientId &&
          (inv.status !== "PAID" || inv.id === formData.invoiceId),
      )
    : [];

  // Filter projects by selected client
  const filteredProjects = formData.clientId
    ? projects.filter((p) => p.clientId === formData.clientId)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Receipt Header */}
      <div className="border-b border-concrete-200 pb-4 mb-2">
        <div className="flex items-center justify-between">
          <img
            src="/images/logo/pubble-logo.jpeg"
            alt="Pubble Plastering"
            className="h-16 w-auto object-contain"
          />
          <div className="text-right">
            <h2 className="text-2xl font-heading font-bold text-concrete-800">
              RECEIPT
            </h2>
            {formData.receiptNumber && (
              <p className="text-concrete-500 text-sm">
                {formData.receiptNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Client & Invoice Selection */}
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
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          {errors.clientId && (
            <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Link to Invoice (Optional)
          </label>
          <div className="relative">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <select
              name="invoiceId"
              value={formData.invoiceId}
              onChange={handleInvoiceSelect}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={!formData.clientId}
            >
              <option value="">No invoice linked</option>
              {filteredInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {formatCurrency(inv.total)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Selection */}
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

      {/* Receipt Details */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Receipt Number
          </label>
          <div className="relative">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              name="receiptNumber"
              value={formData.receiptNumber}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Auto-generated"
              disabled={!!receipt}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Payment Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.paymentDate ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
            />
          </div>
          {errors.paymentDate && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>
          )}
        </div>
      </div>

      {/* Payment Method & Amount */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Payment Method
          </label>
          <div className="relative">
            <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Amount (£) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full px-4 py-2 border rounded-lg ${errors.amount ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>
      </div>

      {/* Reference & Notes */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Payment Reference
          </label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Transaction ID, cheque number, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Notes
          </label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-between gap-3 pt-4 border-t">
        <div className="flex gap-2">
          {receipt && onSendEmail && (
            <Button type="button" variant="outline" onClick={onSendEmail}>
              <FiMail className="w-4 h-4 mr-2" />
              Email Receipt
            </Button>
          )}
          {receipt && onDownloadPDF && (
            <Button type="button" variant="outline" onClick={onDownloadPDF}>
              <FiDownload className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <FiX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button type="submit" loading={isLoading}>
            <FiSave className="w-4 h-4 mr-2" />
            {receipt ? "Update Receipt" : "Create Receipt"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ClientForm Component - Admin Client Management
"use client";
import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiSave,
  FiX,
} from "react-icons/fi";
import Button from "../common/Button";

export default function ClientForm({
  client = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mobile: "",
    company: "",
    address: "",
    city: "",
    postcode: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        mobile: client.mobile || "",
        company: client.company || "",
        address: client.address || "",
        city: client.city || "",
        postcode: client.postcode || "",
        notes: client.notes || "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.name ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
              placeholder="John Smith"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Company name (optional)"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.email ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
              placeholder="email@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.phone ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
              placeholder="01onal 123456"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Mobile
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="07123 456789"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Address
        </label>
        <div className="relative">
          <FiMapPin className="absolute left-3 top-3 text-concrete-400" />
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Street address"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Postcode
          </label>
          <input
            type="text"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="AB12 3CD"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Notes
        </label>
        <div className="relative">
          <FiFileText className="absolute left-3 top-3 text-concrete-400" />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full pl-10 pr-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Internal notes about this client..."
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
          {client ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  );
}

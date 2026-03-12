// Quote Request Form Component
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMessageSquare,
  FiUpload,
  FiX,
  FiCheck,
} from "react-icons/fi";
import Button from "../common/Button";

export default function QuoteForm({ services = [], onSubmit, className = "", variant = "full" }) {
  const router = useRouter();
  const isCompact = variant === "compact";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    serviceType: "",
    preferredContact: "email",
    projectDescription: "",
    timeline: "",
    budget: "",
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-select service from URL query param (?service=plastering)
  useEffect(() => {
    if (router.query.service) {
      const q = router.query.service.toLowerCase();
      // Match against service options (case-insensitive, ignore spaces)
      const match = serviceOptions.find(
        (s) => s.toLowerCase() === q || s.toLowerCase().replace(/\s/g, "") === q
      );
      if (match) {
        setFormData((prev) => ({ ...prev, serviceType: match }));
      } else {
        // Partial match - e.g. "repairs" matches "Wall Repairs"
        const partial = serviceOptions.find((s) => s.toLowerCase().includes(q));
        if (partial) {
          setFormData((prev) => ({ ...prev, serviceType: partial }));
        }
      }
    }
  }, [router.query.service]);

  const defaultServices = [
    "Plastering",
    "Rendering",
    "Skimming",
    "Dry Lining",
    "Coving",
    "Pebble Dashing",
    "Ceiling Repairs",
    "Wall Repairs",
    "Other",
  ];

  const serviceOptions = services.length > 0 ? services : defaultServices;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValid = file.type.startsWith("image/");
      const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB
      return isValid && isUnderLimit;
    });

    if (validFiles.length < files.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Some files were skipped (must be images under 10MB)",
      }));
    }

    // Create preview URLs
    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5), // Max 5 images
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.serviceType) {
      newErrors.serviceType = "Please select a service";
    }

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = "Please describe your project";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          formData.images.forEach((img) => {
            submitData.append("images", img.file);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (onSubmit) {
        await onSubmit(submitData);
      } else {
        // Default API call
        const response = await fetch("/api/quotes", {
          method: "POST",
          body: submitData,
        });

        if (!response.ok) throw new Error("Failed to submit");
      }

      setIsSuccess(true);
    } catch (error) {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`bg-green-50 rounded-2xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-green-800 mb-2">
          Quote Request Sent!
        </h3>
        <p className="text-green-700 mb-6">
          Thank you for your interest. We'll get back to you within 24 hours
          with a free quote.
        </p>
        <Button
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
              postcode: "",
              serviceType: "",
              preferredContact: "email",
              projectDescription: "",
              timeline: "",
              budget: "",
              images: [],
            });
          }}
          variant="outline"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {errors.form && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {errors.form}
        </div>
      )}

      {/* Contact Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.name ? "border-red-500" : "border-concrete-200"
              }`}
              placeholder="John Smith"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.email ? "border-red-500" : "border-concrete-200"
              }`}
              placeholder="john@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.phone ? "border-red-500" : "border-concrete-200"
              }`}
              placeholder="07123 456789"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {!isCompact && (
          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              Preferred Contact Method
            </label>
            <select
              name="preferredContact"
              value={formData.preferredContact}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        )}
      </div>

      {/* Address */}
      {!isCompact && <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Property Address
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="123 High Street, London"
            />
          </div>
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
            className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="SW1A 1AA"
          />
        </div>
      </div>}

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Type of Service Required *
        </label>
        <select
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.serviceType ? "border-red-500" : "border-concrete-200"
          }`}
        >
          <option value="">Select a service...</option>
          {serviceOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
        {errors.serviceType && (
          <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
        )}
      </div>

      {/* Project Description */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Project Description *
        </label>
        <div className="relative">
          <FiMessageSquare className="absolute left-3 top-3 text-concrete-400" />
          <textarea
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            rows={4}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.projectDescription
                ? "border-red-500"
                : "border-concrete-200"
            }`}
            placeholder="Please describe your project, including room sizes, current condition of walls/ceilings, and any specific requirements..."
          />
        </div>
        {errors.projectDescription && (
          <p className="text-red-500 text-sm mt-1">
            {errors.projectDescription}
          </p>
        )}
      </div>

      {/* Timeline & Budget */}
      {!isCompact && <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Preferred Timeline
          </label>
          <select
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select timeline...</option>
            <option value="asap">ASAP</option>
            <option value="1-2weeks">1-2 weeks</option>
            <option value="1month">Within a month</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Approximate Budget
          </label>
          <select
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select budget...</option>
            <option value="under500">Under £500</option>
            <option value="500-1000">£500 - £1,000</option>
            <option value="1000-2500">£1,000 - £2,500</option>
            <option value="2500-5000">£2,500 - £5,000</option>
            <option value="over5000">Over £5,000</option>
            <option value="unsure">Not sure</option>
          </select>
        </div>
      </div>}

      {/* Image Upload */}
      {!isCompact && <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Upload Photos (Optional)
        </label>
        <p className="text-sm text-concrete-500 mb-2">
          Photos help us provide a more accurate quote. Max 5 images, 10MB each.
        </p>

        <div className="border-2 border-dashed border-concrete-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            id="quote-images"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="quote-images"
            className="cursor-pointer flex flex-col items-center"
          >
            <FiUpload className="w-8 h-8 text-concrete-400 mb-2" />
            <span className="text-concrete-600">
              Click to upload or drag and drop
            </span>
            <span className="text-sm text-concrete-400">
              PNG, JPG up to 10MB
            </span>
          </label>
        </div>

        {errors.images && (
          <p className="text-amber-600 text-sm mt-1">{errors.images}</p>
        )}

        {/* Image Previews */}
        {formData.images.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {formData.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending Request..." : "Get Free Quote"}
      </Button>

      <p className="text-center text-sm text-concrete-500">
        We typically respond within 24 hours. No obligation, completely free.
      </p>
    </form>
  );
}

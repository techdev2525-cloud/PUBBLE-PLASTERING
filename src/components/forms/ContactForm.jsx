// Contact Form Component
import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiCheck,
  FiSend,
} from "react-icons/fi";
import Button from "../common/Button";

export default function ContactForm({
  onSubmit,
  showSubject = true,
  className = "",
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
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

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to send message");
      }

      setIsSuccess(true);
    } catch (error) {
      setErrors({ form: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`bg-green-50 rounded-xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-heading font-bold text-green-800 mb-2">
          Message Sent!
        </h3>
        <p className="text-green-700 mb-6">
          Thank you for getting in touch. We'll respond as soon as possible.
        </p>
        <Button
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              subject: "",
              message: "",
            });
          }}
          variant="outline"
          size="sm"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
      {errors.form && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {errors.form}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Your Name *
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

      {/* Email & Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
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

        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="07123 456789"
            />
          </div>
        </div>
      </div>

      {/* Subject */}
      {showSubject && (
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Subject
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a subject...</option>
            <option value="general">General Enquiry</option>
            <option value="quote">Request a Quote</option>
            <option value="project">Existing Project</option>
            <option value="feedback">Feedback</option>
            <option value="complaint">Complaint</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Your Message *
        </label>
        <div className="relative">
          <FiMessageSquare className="absolute left-3 top-3 text-concrete-400" />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
              errors.message ? "border-red-500" : "border-concrete-200"
            }`}
            placeholder="How can we help you?"
          />
        </div>
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">{errors.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
        icon={<FiSend />}
        iconPosition="right"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

// Newsletter Signup Form
export function NewsletterForm({ onSubmit, className = "" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error();
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Enter your email"
          className={`flex-1 px-4 py-3 rounded-lg border ${
            status === "error" ? "border-red-500" : "border-concrete-200"
          } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
        />
        <Button type="submit" variant="primary" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Subscribe"}
        </Button>
      </div>
      {status === "success" && (
        <p className="text-green-600 text-sm mt-2">Thanks for subscribing!</p>
      )}
      {status === "error" && (
        <p className="text-red-500 text-sm mt-2">Please enter a valid email.</p>
      )}
    </form>
  );
}

// Quick callback request form
export function CallbackForm({ onSubmit, className = "" }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    time: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await fetch("/api/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setIsSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-green-700 font-medium">We'll call you back soon!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Your Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
      />

      <input
        type="tel"
        placeholder="Phone Number *"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
      />

      <select
        value={formData.time}
        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Best time to call...</option>
        <option value="morning">Morning (9am - 12pm)</option>
        <option value="afternoon">Afternoon (12pm - 5pm)</option>
        <option value="evening">Evening (5pm - 8pm)</option>
        <option value="anytime">Any time</option>
      </select>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Requesting..." : "Request Callback"}
      </Button>
    </form>
  );
}

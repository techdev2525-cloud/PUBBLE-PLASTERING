// Admin Settings Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  FiSave,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiFileText,
  FiLock,
  FiUser,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    companyName: siteSettings.company?.name || "Pubble Plastering",
    email: siteSettings.company?.email || "info@pubbleplastering.co.uk",
    phone: siteSettings.company?.phone || "07123 456789",
    address: "123 Business Street, Leeds, LS1 1AA",
    vatNumber: "GB123456789",
    companyNumber: "12345678",
    defaultVatRate: "20",
    invoicePrefix: "INV",
    receiptPrefix: "REC",
    invoiceTerms: "Payment due within 14 days.",
    emailNotifications: true,
    quoteAlerts: true,
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: FiGlobe },
    { id: "invoicing", label: "Invoicing", icon: FiFileText },
    { id: "notifications", label: "Notifications", icon: FiMail },
    { id: "account", label: "Account", icon: FiUser },
  ];

  return (
    <>
      <Head>
        <title>
          Settings | Admin - {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Settings">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary-50 text-primary-700"
                          : "text-concrete-600 hover:bg-concrete-50"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSave}>
              <div className="bg-white rounded-xl shadow-sm">
                {/* General Settings */}
                {activeTab === "general" && (
                  <div className="p-6">
                    <h2 className="font-heading font-bold text-lg text-concrete-800 mb-6">
                      Company Information
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-concrete-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={settings.companyName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-concrete-700 mb-2">
                            <FiMail className="w-4 h-4 inline mr-1" />
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={settings.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-concrete-700 mb-2">
                            <FiPhone className="w-4 h-4 inline mr-1" />
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={settings.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-concrete-700 mb-2">
                          <FiMapPin className="w-4 h-4 inline mr-1" />
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={settings.address}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-concrete-700 mb-2">
                            VAT Number
                          </label>
                          <input
                            type="text"
                            name="vatNumber"
                            value={settings.vatNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-concrete-700 mb-2">
                            Company Number
                          </label>
                          <input
                            type="text"
                            name="companyNumber"
                            value={settings.companyNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoicing Settings */}
                {activeTab === "invoicing" && (
                  <div className="p-6">
                    <h2 className="font-heading font-bold text-lg text-concrete-800 mb-6">
                      Invoice & Receipt Settings
                    </h2>

                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-concrete-700 mb-2">
                            Default VAT Rate (%)
                          </label>
                          <input
                            type="number"
                            name="defaultVatRate"
                            value={settings.defaultVatRate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-concrete-700 mb-2">
                            Invoice Prefix
                          </label>
                          <input
                            type="text"
                            name="invoicePrefix"
                            value={settings.invoicePrefix}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-concrete-700 mb-2">
                            Receipt Prefix
                          </label>
                          <input
                            type="text"
                            name="receiptPrefix"
                            value={settings.receiptPrefix}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-concrete-700 mb-2">
                          Default Invoice Terms
                        </label>
                        <textarea
                          name="invoiceTerms"
                          value={settings.invoiceTerms}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === "notifications" && (
                  <div className="p-6">
                    <h2 className="font-heading font-bold text-lg text-concrete-800 mb-6">
                      Email Notifications
                    </h2>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-concrete-50 rounded-lg cursor-pointer">
                        <div>
                          <p className="font-medium text-concrete-800">
                            Email Notifications
                          </p>
                          <p className="text-sm text-concrete-500">
                            Receive email notifications for important updates
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleChange}
                          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-concrete-50 rounded-lg cursor-pointer">
                        <div>
                          <p className="font-medium text-concrete-800">
                            New Quote Alerts
                          </p>
                          <p className="text-sm text-concrete-500">
                            Get notified when new quote requests come in
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          name="quoteAlerts"
                          checked={settings.quoteAlerts}
                          onChange={handleChange}
                          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Account Settings */}
                {activeTab === "account" && (
                  <div className="p-6">
                    <h2 className="font-heading font-bold text-lg text-concrete-800 mb-6">
                      Account Settings
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-concrete-700 mb-2">
                          <FiUser className="w-4 h-4 inline mr-1" />
                          Username
                        </label>
                        <input
                          type="text"
                          value="admin"
                          disabled
                          className="w-full px-4 py-2 border border-concrete-200 rounded-lg bg-concrete-50 text-concrete-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-concrete-700 mb-2">
                          <FiMail className="w-4 h-4 inline mr-1" />
                          Admin Email
                        </label>
                        <input
                          type="email"
                          value="admin@pubbleplastering.co.uk"
                          className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="pt-4 border-t border-concrete-200">
                        <h3 className="font-medium text-concrete-800 mb-4 flex items-center gap-2">
                          <FiLock className="w-4 h-4" />
                          Change Password
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-concrete-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-concrete-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-concrete-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="px-6 py-4 bg-concrete-50 border-t border-concrete-100 flex items-center justify-between rounded-b-xl">
                  {saved && (
                    <span className="text-green-600 font-medium">
                      Settings saved successfully!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <FiSave className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

// Admin Layout Component
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {
  FiHome,
  FiUsers,
  FiFolder,
  FiFileText,
  FiDollarSign,
  FiEdit3,
  FiImage,
  FiMail,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiUser,
  FiCheck,
  FiCheckCircle,
  FiMessageSquare,
  FiAlertCircle,
  FiInbox,
} from "react-icons/fi";
import { siteSettings } from "@/config/siteSettings";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FiHome },
  { href: "/admin/clients", label: "Clients", icon: FiUsers },
  { href: "/admin/projects", label: "Projects", icon: FiFolder },
  { href: "/admin/invoices", label: "Invoices", icon: FiFileText },
  { href: "/admin/receipts", label: "Receipts", icon: FiDollarSign },
  { href: "/admin/finances", label: "Finances", icon: FiDollarSign },
  { href: "/admin/blog", label: "Blog", icon: FiEdit3 },
  { href: "/admin/media", label: "Media", icon: FiImage },
  { href: "/admin/quote-requests", label: "Quote Requests", icon: FiMail },
  { href: "/admin/settings", label: "Settings", icon: FiSettings },
];

export default function AdminLayout({ children, title = "Dashboard" }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  // Fetch notifications
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60 * 1000); // poll every 60s
    return () => clearInterval(interval);
  }, [status]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // silent
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // silent
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.link) {
      setNotifOpen(false);
      router.push(notif.link);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "QUOTE_REQUEST":
        return <FiMessageSquare className="w-4 h-4 text-blue-500" />;
      case "INVOICE_OVERDUE":
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      case "CONTACT_MESSAGE":
        return <FiMail className="w-4 h-4 text-green-500" />;
      default:
        return <FiBell className="w-4 h-4 text-primary-500" />;
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-concrete-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!session) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-concrete-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-concrete-900 transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-concrete-700">
            <Link
              href="/admin"
              className="text-white font-heading font-bold text-xl"
            >
              {siteSettings.company?.name || "Pubble"}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-concrete-400 hover:text-white"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  router.pathname === item.href ||
                  (item.href !== "/admin" &&
                    router.pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-concrete-300 hover:bg-concrete-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-concrete-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-concrete-300 hover:bg-concrete-800 hover:text-white rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-concrete-600 hover:text-concrete-800"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <h1 className="font-heading font-bold text-xl text-concrete-800">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-concrete-500 hover:text-concrete-700 hover:bg-concrete-100 rounded-lg transition-colors"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-concrete-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-concrete-100">
                      <h3 className="font-semibold text-concrete-800 text-sm">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <FiInbox className="w-8 h-8 text-concrete-300 mx-auto mb-2" />
                          <p className="text-sm text-concrete-500">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-concrete-50 transition-colors border-b border-concrete-50 ${
                              !notif.read ? "bg-primary-50/40" : ""
                            }`}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm leading-snug ${
                                  !notif.read
                                    ? "font-medium text-concrete-800"
                                    : "text-concrete-600"
                                }`}
                              >
                                {notif.title}
                              </p>
                              <p className="text-xs text-concrete-500 mt-0.5 truncate">
                                {notif.message}
                              </p>
                              <p className="text-[11px] text-concrete-400 mt-1">
                                {timeAgo(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="mt-1.5 flex-shrink-0">
                                <span className="w-2 h-2 bg-primary-500 rounded-full block" />
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-concrete-100 bg-concrete-50">
                        <Link
                          href="/admin/quote-requests"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all quote requests &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-concrete-200">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-primary-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-concrete-800">Admin</p>
                  <p className="text-xs text-concrete-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

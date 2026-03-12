// Sidebar Component for Admin Dashboard
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiHome,
  FiUsers,
  FiFolder,
  FiFileText,
  FiDollarSign,
  FiEdit3,
  FiImage,
  FiMessageSquare,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiBarChart2,
} from "react-icons/fi";
import { signOut } from "next-auth/react";

const menuItems = [
  {
    section: "Main",
    items: [
      { href: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
      { href: "/admin/analytics", icon: FiBarChart2, label: "Analytics" },
    ],
  },
  {
    section: "Business",
    items: [
      { href: "/admin/clients", icon: FiUsers, label: "Clients" },
      { href: "/admin/projects", icon: FiFolder, label: "Projects" },
      { href: "/admin/invoices", icon: FiFileText, label: "Invoices" },
      { href: "/admin/receipts", icon: FiDollarSign, label: "Receipts" },
      {
        href: "/admin/quote-requests",
        icon: FiMessageSquare,
        label: "Quote Requests",
        badge: true,
      },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/blog", icon: FiEdit3, label: "Blog" },
      { href: "/admin/media", icon: FiImage, label: "Media" },
    ],
  },
  {
    section: "System",
    items: [{ href: "/admin/settings", icon: FiSettings, label: "Settings" }],
  },
];

export default function Sidebar({ newQuotesCount = 0 }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        bg-concrete-900 text-white
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
        flex flex-col
      `}
    >
      {/* Logo */}
      <div className="p-4 border-b border-concrete-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">PP</span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-heading font-bold text-sm whitespace-nowrap">
                Pubble Plastering
              </h1>
              <p className="text-xs text-concrete-400">Admin Dashboard</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-concrete-500 uppercase tracking-wider">
                {section.section}
              </h3>
            )}
            <ul className="space-y-1 px-3">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors duration-200
                      ${
                        isActive(item.href)
                          ? "bg-primary-500 text-white"
                          : "text-concrete-300 hover:bg-concrete-800 hover:text-white"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && newQuotesCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {newQuotesCount}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge && newQuotesCount > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-concrete-800">
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-concrete-400 hover:bg-concrete-800 hover:text-white transition-colors mb-2"
        >
          {isCollapsed ? (
            <FiChevronRight className="w-5 h-5" />
          ) : (
            <>
              <FiChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-concrete-300 hover:bg-red-500/20 hover:text-red-400
            transition-colors
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? "Logout" : undefined}
        >
          <FiLogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// Mobile Sidebar
export function MobileSidebar({ isOpen, onClose, newQuotesCount = 0 }) {
  const router = useRouter();

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-concrete-900 text-white z-50 lg:hidden animate-slide-up">
        {/* Logo */}
        <div className="p-4 border-b border-concrete-800 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">PP</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm">
                Pubble Plastering
              </h1>
              <p className="text-xs text-concrete-400">Admin Dashboard</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-concrete-800"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((section) => (
            <div key={section.section} className="mb-6">
              <h3 className="px-4 mb-2 text-xs font-semibold text-concrete-500 uppercase tracking-wider">
                {section.section}
              </h3>
              <ul className="space-y-1 px-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-colors duration-200
                        ${
                          isActive(item.href)
                            ? "bg-primary-500 text-white"
                            : "text-concrete-300 hover:bg-concrete-800 hover:text-white"
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && newQuotesCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {newQuotesCount}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

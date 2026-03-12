// Admin Layout Component
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiSearch,
} from "react-icons/fi";
import { signOut } from "next-auth/react";
import Sidebar, { MobileSidebar } from "./Sidebar";
import { CompactFooter } from "./Footer";
import { PageLoader } from "../common/Loader";
import SearchBar from "../common/SearchBar";
import { siteSettings } from "../../config/siteSettings";

export default function AdminLayout({
  children,
  title = "Admin Dashboard",
  description,
  showSearch = true,
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newQuotesCount, setNewQuotesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch new quotes count
  useEffect(() => {
    const fetchNewQuotes = async () => {
      try {
        const res = await fetch("/api/quotes/count?status=NEW");
        const data = await res.json();
        setNewQuotesCount(data.count || 0);
      } catch (error) {
        console.error("Error fetching quotes count:", error);
      }
    };

    if (session) {
      fetchNewQuotes();
      // Refresh every 5 minutes
      const interval = setInterval(fetchNewQuotes, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return <PageLoader />;
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  const handleSearch = (query) => {
    if (query.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <>
      <Head>
        <title>
          {title} | {siteSettings.company.name} Admin
        </title>
        {description && <meta name="description" content={description} />}
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-concrete-100 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar newQuotesCount={newQuotesCount} />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          newQuotesCount={newQuotesCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Top Header */}
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 lg:px-6 h-16">
              {/* Left Side */}
              <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-concrete-100"
                >
                  <FiMenu className="w-6 h-6 text-concrete-600" />
                </button>

                {/* Page Title */}
                <div className="hidden sm:block">
                  <h1 className="text-xl font-heading font-semibold text-concrete-800">
                    {title}
                  </h1>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-3">
                {/* Search */}
                {showSearch && (
                  <div className="hidden md:block w-64">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSearch={handleSearch}
                      placeholder="Search..."
                      size="sm"
                    />
                  </div>
                )}

                {/* Notifications */}
                <Link
                  href="/admin/quote-requests"
                  className="relative p-2 rounded-lg hover:bg-concrete-100 transition-colors"
                >
                  <FiBell className="w-5 h-5 text-concrete-600" />
                  {newQuotesCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {newQuotesCount > 9 ? "9+" : newQuotesCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-concrete-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {session.user?.name?.charAt(0) || "A"}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-concrete-700">
                      {session.user?.name || "Admin"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-concrete-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-concrete-100">
                          <p className="font-medium text-concrete-800">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-concrete-500">
                            {session.user?.email}
                          </p>
                        </div>
                        <Link
                          href="/admin/profile"
                          className="flex items-center gap-3 px-4 py-2 text-concrete-600 hover:bg-concrete-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiUser className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/admin/settings"
                          className="flex items-center gap-3 px-4 py-2 text-concrete-600 hover:bg-concrete-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiSettings className="w-4 h-4" />
                          Settings
                        </Link>
                        <hr className="my-2 border-concrete-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            {showSearch && (
              <div className="md:hidden px-4 pb-4">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  placeholder="Search..."
                  size="sm"
                />
              </div>
            )}
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">{children}</main>

          {/* Footer */}
          <CompactFooter />
        </div>
      </div>
    </>
  );
}

// Page Header Component
export function PageHeader({ title, subtitle, children, breadcrumbs }) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-concrete-500">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href || index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary-500">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-concrete-800">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-concrete-800">
            {title}
          </h1>
          {subtitle && <p className="text-concrete-500 mt-1">{subtitle}</p>}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

// Content Card Component
export function ContentCard({ title, children, action, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-concrete-100">
          <h2 className="font-heading font-semibold text-lg text-concrete-800">
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

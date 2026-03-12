// Admin Blog Posts List Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiClock,
  FiCalendar,
  FiLoader,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

const statusConfig = {
  DRAFT: { label: "Draft", color: "bg-concrete-100 text-concrete-600" },
  PUBLISHED: { label: "Published", color: "bg-green-100 text-green-600" },
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-600" },
  ARCHIVED: { label: "Archived", color: "bg-concrete-100 text-concrete-500" },
};

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ includeUnpublished: "true" });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/blog?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const filteredPosts = posts;

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const post = posts.find((p) => p.id === id);
        const res = await fetch(`/api/blog/${post?.slug || id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete post");
        fetchPosts();
      } catch (err) {
        alert("Error deleting post: " + err.message);
      }
    }
  };

  if (loading && posts.length === 0) {
    return (
      <>
        <Head>
          <title>
            Blog Posts | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Blog Posts">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          Blog Posts | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Blog Posts">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            New Post
          </Link>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-concrete-50 border-b border-concrete-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Post
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-concrete-600 hidden lg:table-cell">
                    Views
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-concrete-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {filteredPosts.map((post) => {
                  const status = statusConfig[post.status];
                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-concrete-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/admin/blog/${post.slug}`}
                            className="font-medium text-concrete-800 hover:text-primary-600"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-xs text-concrete-400">
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {post.readTime}
                            </span>
                            <span>{post.author?.name || post.author}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-concrete-600 hidden md:table-cell">
                        {post.category}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-concrete-500 hidden lg:table-cell">
                        {post.publishedAt ? (
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-concrete-600 hidden lg:table-cell">
                        {(post.views || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="p-2 text-concrete-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                            target="_blank"
                          >
                            <FiEye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/blog/${post.slug}`}
                            className="p-2 text-concrete-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-concrete-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-concrete-500">No posts found</p>
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 mt-4 text-primary-600 font-medium hover:underline"
              >
                <FiPlus className="w-4 h-4" />
                Write your first post
              </Link>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

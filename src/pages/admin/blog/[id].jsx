// Admin Edit Blog Post Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import BlogEditor from "@/components/admin/BlogEditor";
import { siteSettings } from "@/config/siteSettings";

export default function EditBlogPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      // Try to fetch by slug first, then by id
      const res = await fetch(`/api/blog/${id}?includeUnpublished=true`);
      if (!res.ok) throw new Error("Post not found");
      const data = await res.json();
      setPost(data);
    } catch (err) {
      alert("Error loading post: " + err.message);
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await fetch(`/api/blog/${post?.slug || id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update post");
      }

      router.push("/admin/blog");
    } catch (err) {
      alert("Error updating post: " + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>
            Edit Post | Admin -{" "}
            {siteSettings.company?.name || "Pubble Plastering"}
          </title>
        </Head>
        <AdminLayout title="Edit Blog Post">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </AdminLayout>
      </>
    );
  }

  if (!post) return null;

  return (
    <>
      <Head>
        <title>
          Edit Post | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Edit Blog Post">
        <div className="mb-6">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        <BlogEditor post={post} onSubmit={handleSubmit} />
      </AdminLayout>
    </>
  );
}

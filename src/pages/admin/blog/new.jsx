// Admin New Blog Post Page
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import BlogEditor from "@/components/admin/BlogEditor";
import { siteSettings } from "@/config/siteSettings";

export default function NewBlogPostPage() {
  const router = useRouter();

  const handleSubmit = async (data) => {
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create blog post");
      }

      router.push("/admin/blog");
    } catch (err) {
      alert("Error creating blog post: " + err.message);
    }
  };

  return (
    <>
      <Head>
        <title>
          New Blog Post | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="New Blog Post">
        <div className="mb-6">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-concrete-500 hover:text-concrete-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        <BlogEditor onSubmit={handleSubmit} />
      </AdminLayout>
    </>
  );
}

// Blog Post Page - Fetches real data from API
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  FiClock,
  FiUser,
  FiCalendar,
  FiTag,
  FiArrowLeft,
  FiShare2,
  FiLoader,
} from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteSettings } from "@/config/siteSettings";

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) {
        router.replace("/blog");
        return;
      }
      const data = await res.json();
      setPost(data);

      // Fetch related posts (same category or recent)
      const relRes = await fetch(`/api/blog?limit=3`);
      if (relRes.ok) {
        const relData = await relRes.json();
        setRelatedPosts(
          (relData.posts || []).filter((p) => p.slug !== slug).slice(0, 2),
        );
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      router.replace("/blog");
    } finally {
      setLoading(false);
    }
  };

  const tags = Array.isArray(post?.tags) ? post.tags : [];
  const categoryName =
    siteSettings.blogCategories?.find((c) => c.id === post?.category)?.name ||
    post?.category ||
    "";

  if (loading || !post) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          {post.title +
            " | " +
            (siteSettings.company?.name || "Pubble Plastering")}
        </title>
        <meta name="description" content={post.excerpt || ""} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || ""} />
        <meta property="og:type" content="article" />
        {post.publishedAt && (
          <meta property="article:published_time" content={post.publishedAt} />
        )}
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="py-12 bg-concrete-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-concrete-400 hover:text-white mb-6 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {categoryName && (
                  <span className="px-3 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                    {categoryName}
                  </span>
                )}
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-concrete-400 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-concrete-300 mb-8">{post.excerpt}</p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-concrete-400">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-concrete-700 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {post.author?.name || "Admin"}
                    </p>
                  </div>
                </div>
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {post.readTime || 0} min read
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="container mx-auto px-4 -mt-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video bg-concrete-200 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 900px"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-concrete-800 prose-p:text-concrete-600 prose-a:text-primary-600">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(post.content),
                  }}
                />
              </article>
            </div>
          </div>
        </section>

        {/* Tags */}
        {tags.length > 0 && (
          <section className="py-8 border-t border-concrete-200">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2">
                <FiTag className="w-5 h-5 text-concrete-400" />
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-concrete-100 text-concrete-600 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-concrete-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="font-heading font-bold text-2xl text-concrete-800 mb-8">
                  More Articles
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      className="bg-white rounded-xl shadow-sm overflow-hidden group"
                    >
                      <div className="relative aspect-video bg-concrete-200">
                        {related.featuredImage ? (
                          <Image
                            src={related.featuredImage}
                            alt={related.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-concrete-400">
                            <span className="text-5xl">📝</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading font-bold text-lg text-concrete-800 group-hover:text-primary-600 transition-colors mb-2">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-concrete-600 text-sm line-clamp-2">
                            {related.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-primary-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Whether it&apos;s a small repair or a complete renovation,
              we&apos;re here to help. Get in touch for a free, no-obligation
              quote.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-concrete-100 transition-colors"
              >
                Get a Free Quote
              </Link>
              <Link
                href="/projects"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// Simple markdown to HTML renderer for blog content
function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    // Escape HTML entities to prevent XSS
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Inline code
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // Unordered lists
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Paragraphs (double newline)
    .replace(/\n\n/g, "</p><p>")
    // Single newlines
    .replace(/\n/g, "<br>");

  // Wrap <li> groups in <ul>
  html = html.replace(/(<li>.*?<\/li>)(?:\s*<br>)*(<li>)/g, "$1$2");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => `<ul>${match}</ul>`);
  // Remove nested <ul> from consecutive matches
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  return `<p>${html}</p>`;
}

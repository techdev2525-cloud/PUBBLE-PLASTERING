// Blog Index Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  FiClock,
  FiUser,
  FiArrowRight,
  FiSearch,
  FiTag,
  FiLoader,
} from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteSettings } from "@/config/siteSettings";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog?limit=50");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build category list from actual posts
  const categoryCounts = posts.reduce((acc, post) => {
    if (post.category) {
      acc[post.category] = (acc[post.category] || 0) + 1;
    }
    return acc;
  }, {});

  const categories = [
    { id: "all", name: "All Posts", count: posts.length },
    ...Object.entries(categoryCounts).map(([cat, count]) => ({
      id: cat,
      name: siteSettings.blogCategories?.find((c) => c.id === cat)?.name || cat,
      count,
    })),
  ];

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts[0];

  return (
    <>
      <Head>
        <title>
          {"Blog - Plastering Tips & Guides | " +
            (siteSettings.company?.name || "Pubble Plastering")}
        </title>
        <meta
          name="description"
          content="Expert plastering tips, guides, and insights from the professionals. Learn about techniques, maintenance, and home improvement."
        />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-concrete-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-primary-500 font-semibold">Our Blog</span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mt-2 mb-6">
                Plastering Tips & Insights
              </h1>
              <p className="text-xl text-concrete-300">
                Expert advice, how-to guides, and behind-the-scenes looks at our
                projects.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-concrete-50">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : posts.length === 0 ? (
          <section className="py-20 bg-concrete-50">
            <div className="container mx-auto px-4 text-center">
              <p className="text-concrete-500 text-lg">
                No blog posts yet. Check back soon!
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <section className="py-12 bg-white border-b border-concrete-200">
                <div className="container mx-auto px-4">
                  <div className="grid lg:grid-cols-2 gap-8 items-center -mt-24">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-concrete-200 shadow-xl">
                      {featuredPost.featuredImage ? (
                        <Image
                          src={featuredPost.featuredImage}
                          alt={featuredPost.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-concrete-900/60 flex items-center justify-center text-concrete-400">
                          <span className="text-6xl">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="lg:pt-20">
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                        Featured Post
                      </span>
                      {featuredPost.category && (
                        <span className="text-sm text-concrete-500 ml-2">
                          {siteSettings.blogCategories?.find(
                            (c) => c.id === featuredPost.category,
                          )?.name || featuredPost.category}
                        </span>
                      )}
                      <h2 className="font-heading font-bold text-2xl md:text-3xl text-concrete-800 mb-4">
                        <Link
                          href={`/blog/${featuredPost.slug}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {featuredPost.title}
                        </Link>
                      </h2>
                      <p className="text-concrete-600 mb-6">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-concrete-500 mb-6">
                        <span className="flex items-center gap-1">
                          <FiUser className="w-4 h-4" />
                          {featuredPost.author?.name || "Admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {featuredPost.readTime || 0} min read
                        </span>
                      </div>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
                      >
                        Read Article
                        <FiArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Blog Posts Grid */}
            <section className="py-20 bg-concrete-50">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-4 gap-8">
                  {/* Sidebar */}
                  <aside className="lg:col-span-1">
                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h3 className="font-semibold text-concrete-800 mb-4">
                        Search
                      </h3>
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search articles..."
                          className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h3 className="font-semibold text-concrete-800 mb-4">
                        Categories
                      </h3>
                      <ul className="space-y-2">
                        {categories.map((category) => (
                          <li key={category.id}>
                            <button
                              onClick={() => setSelectedCategory(category.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                selectedCategory === category.id
                                  ? "bg-primary-50 text-primary-700"
                                  : "hover:bg-concrete-50 text-concrete-600"
                              }`}
                            >
                              <span>{category.name}</span>
                              <span className="text-sm text-concrete-400">
                                {category.count}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="bg-primary-50 rounded-xl p-6">
                      <h3 className="font-semibold text-concrete-800 mb-2">
                        Need Plastering Work?
                      </h3>
                      <p className="text-sm text-concrete-600 mb-4">
                        Get a free, no-obligation quote for your project.
                      </p>
                      <Link
                        href="/contact"
                        className="block w-full px-4 py-2 bg-primary-600 text-white text-center font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Get a Quote
                      </Link>
                    </div>
                  </aside>

                  {/* Posts Grid */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-heading font-bold text-xl text-concrete-800">
                        {selectedCategory === "all"
                          ? "All Articles"
                          : categories.find((c) => c.id === selectedCategory)
                              ?.name}
                      </h2>
                      <span className="text-concrete-500 text-sm">
                        {filteredPosts.length}{" "}
                        {filteredPosts.length === 1 ? "article" : "articles"}
                      </span>
                    </div>

                    {filteredPosts.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-8">
                        {filteredPosts.map((post) => (
                          <article
                            key={post.id}
                            className="bg-white rounded-xl shadow-sm overflow-hidden group"
                          >
                            <Link href={`/blog/${post.slug}`}>
                              <div className="relative aspect-video bg-concrete-200">
                                {post.featuredImage ? (
                                  <Image
                                    src={post.featuredImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-concrete-400">
                                    <span className="text-5xl">📝</span>
                                  </div>
                                )}
                                {post.category && (
                                  <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 text-concrete-700 text-sm font-medium rounded-full">
                                      {siteSettings.blogCategories?.find(
                                        (c) => c.id === post.category,
                                      )?.name || post.category}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="p-6">
                              <h3 className="font-heading font-bold text-lg text-concrete-800 mb-2 group-hover:text-primary-600 transition-colors">
                                <Link href={`/blog/${post.slug}`}>
                                  {post.title}
                                </Link>
                              </h3>
                              {post.excerpt && (
                                <p className="text-concrete-600 text-sm mb-4 line-clamp-2">
                                  {post.excerpt}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-concrete-500">
                                  {post.publishedAt
                                    ? new Date(
                                        post.publishedAt,
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "Draft"}
                                </span>
                                <span className="flex items-center gap-1 text-concrete-500">
                                  <FiClock className="w-4 h-4" />
                                  {post.readTime || 0} min read
                                </span>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl">
                        <p className="text-concrete-500">
                          No articles found matching your criteria.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedCategory("all");
                            setSearchQuery("");
                          }}
                          className="mt-4 text-primary-600 font-semibold hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

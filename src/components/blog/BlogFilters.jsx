// BlogFilters Component
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiFilter, FiX } from "react-icons/fi";
import SearchBar from "../common/SearchBar";

export default function BlogFilters({
  categories = [],
  tags = [],
  activeCategory = null,
  activeTag = null,
  searchQuery = "",
  onSearchChange,
  onSearch,
  showSearch = true,
}) {
  const router = useRouter();

  const clearFilters = () => {
    router.push("/blog");
  };

  const hasActiveFilters = activeCategory || activeTag || searchQuery;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {showSearch && (
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={onSearch}
          placeholder="Search articles..."
          size="lg"
          showButton
          buttonText="Search"
        />
      )}

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-concrete-500 flex items-center gap-2">
          <FiFilter className="w-4 h-4" />
          Filter:
        </span>

        {/* All Posts */}
        <Link
          href="/blog"
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all
            ${
              !activeCategory && !activeTag
                ? "bg-primary-500 text-white shadow-md"
                : "bg-concrete-100 text-concrete-600 hover:bg-concrete-200"
            }
          `}
        >
          All Posts
        </Link>

        {/* Category Pills */}
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                activeCategory === category.slug
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-concrete-100 text-concrete-600 hover:bg-concrete-200"
              }
            `}
          >
            {category.name}
            {category._count?.posts !== undefined && (
              <span className="ml-1 opacity-70">({category._count.posts})</span>
            )}
          </Link>
        ))}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <FiX className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Tags (shown when a tag is active or as a list) */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-concrete-500">Tags:</span>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog/tag/${tag.slug}`}
              className={`
                text-sm px-3 py-1 rounded-full transition-all
                ${
                  activeTag === tag.slug
                    ? "bg-primary-500 text-white"
                    : "bg-concrete-50 text-concrete-600 hover:bg-concrete-100"
                }
              `}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Sidebar Filters for category pages
export function BlogSidebarFilters({
  categories = [],
  tags = [],
  popularPosts = [],
  activeCategory = null,
  activeTag = null,
}) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-4">
          Categories
        </h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/blog/category/${category.slug}`}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                  ${
                    activeCategory === category.slug
                      ? "bg-primary-50 text-primary-600"
                      : "text-concrete-600 hover:bg-concrete-50"
                  }
                `}
              >
                <span>{category.name}</span>
                {category._count?.posts !== undefined && (
                  <span className="text-sm text-concrete-400">
                    {category._count.posts}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-4">
            Popular Posts
          </h3>
          <ul className="space-y-4">
            {popularPosts.map((post, index) => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-concrete-700 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-4">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className={`
                  text-sm px-3 py-1 rounded-full transition-all
                  ${
                    activeTag === tag.slug
                      ? "bg-primary-500 text-white"
                      : "bg-concrete-100 text-concrete-600 hover:bg-primary-100 hover:text-primary-600"
                  }
                `}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-primary-500 rounded-xl p-6 text-white">
        <h3 className="font-heading font-bold text-xl mb-2">
          Need Plastering Help?
        </h3>
        <p className="text-white/80 mb-4">
          Get a free quote for your project today.
        </p>
        <Link
          href="/contact"
          className="inline-block w-full text-center bg-white text-primary-600 font-semibold py-3 rounded-lg hover:bg-concrete-100 transition-colors"
        >
          Get Free Quote
        </Link>
      </div>
    </div>
  );
}

// Mobile Filter Drawer
export function MobileBlogFilters({
  isOpen,
  onClose,
  categories,
  tags,
  activeCategory,
  activeTag,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-white z-50 lg:hidden overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-concrete-200 px-4 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-concrete-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <BlogSidebarFilters
            categories={categories}
            tags={tags}
            activeCategory={activeCategory}
            activeTag={activeTag}
          />
        </div>
      </div>
    </>
  );
}

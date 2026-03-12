// BlogGrid Component
import React from "react";
import BlogCard, { FeaturedBlogCard } from "./BlogCard";
import { BlogCardSkeleton } from "../common/Loader";

export default function BlogGrid({
  posts,
  loading = false,
  variant = "default",
  columns = 3,
  showFeatured = false,
  emptyMessage = "No posts found",
}) {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (loading) {
    return (
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {[...Array(6)].map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-concrete-800 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-concrete-500">Check back later for new content.</p>
      </div>
    );
  }

  // Featured layout: First post is large, rest are in grid
  if (showFeatured && posts.length > 0) {
    const [featuredPost, ...restPosts] = posts;

    return (
      <div className="space-y-8">
        {/* Featured Post */}
        <FeaturedBlogCard post={featuredPost} />

        {/* Rest of Posts */}
        {restPosts.length > 0 && (
          <div className={`grid ${columnClasses[columns]} gap-6`}>
            {restPosts.map((post) => (
              <BlogCard key={post.id} post={post} variant={variant} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${columnClasses[columns]} gap-6`}>
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} variant={variant} />
      ))}
    </div>
  );
}

// Two-column layout with sidebar
export function BlogGridWithSidebar({ posts, sidebar, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-concrete-200 rounded w-1/2 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-concrete-200 rounded" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1">
        <BlogGrid posts={posts} columns={2} />
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0">{sidebar}</aside>
    </div>
  );
}

// Masonry-style layout
export function BlogMasonryGrid({ posts, loading }) {
  if (loading) {
    return (
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="break-inside-avoid">
            <BlogCardSkeleton imageHeight={200 + Math.random() * 100} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {posts.map((post, index) => (
        <div key={post.id} className="break-inside-avoid">
          <BlogCard post={post} showExcerpt={index % 2 === 0} />
        </div>
      ))}
    </div>
  );
}

// List layout
export function BlogList({ posts, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 bg-white rounded-xl animate-pulse"
          >
            <div className="w-24 h-24 bg-concrete-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-concrete-200 rounded w-3/4" />
              <div className="h-3 bg-concrete-200 rounded" />
              <div className="h-3 bg-concrete-200 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} variant="horizontal" />
      ))}
    </div>
  );
}

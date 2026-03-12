// Related Posts Component
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FiCalendar, FiArrowRight, FiClock } from "react-icons/fi";
import { formatDate } from "@/utils/dateFormatter";

export default function RelatedPosts({
  posts = [],
  title = "Related Articles",
  variant = "default", // default, compact, cards, sidebar
  maxPosts = 3,
  className = "",
}) {
  if (!posts || posts.length === 0) return null;

  const displayPosts = posts.slice(0, maxPosts);

  const variants = {
    default: (
      <div className={`py-12 ${className}`}>
        <h2 className="font-heading font-bold text-2xl text-concrete-800 mb-6">
          {title}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {displayPosts.map((post) => (
            <RelatedPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    ),

    compact: (
      <div className={`space-y-4 ${className}`}>
        <h3 className="font-heading font-semibold text-lg text-concrete-800">
          {title}
        </h3>
        {displayPosts.map((post) => (
          <CompactRelatedPost key={post.id} post={post} />
        ))}
      </div>
    ),

    cards: (
      <div className={`bg-concrete-50 rounded-2xl p-8 ${className}`}>
        <h2 className="font-heading font-bold text-2xl text-concrete-800 mb-8 text-center">
          {title}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {displayPosts.map((post) => (
            <CardRelatedPost key={post.id} post={post} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
          >
            View All Posts
            <FiArrowRight />
          </Link>
        </div>
      </div>
    ),

    sidebar: (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-4">
          {title}
        </h3>
        <div className="space-y-4">
          {displayPosts.map((post, index) => (
            <SidebarRelatedPost key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    ),
  };

  return variants[variant] || variants.default;
}

// Standard Related Post Card
function RelatedPostCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.imageAlt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-4xl font-heading font-bold text-primary-500 opacity-50">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Category Badge */}
        {post.category && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded">
            {post.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-concrete-800 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-sm text-concrete-500">
          <span className="flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          {post.readTime && (
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {post.readTime} min read
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact List Item
function CompactRelatedPost({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex gap-4 items-start">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.imageAlt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-concrete-800 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
          {post.title}
        </h4>
        <span className="text-xs text-concrete-500 mt-1 block">
          {formatDate(post.publishedAt || post.createdAt, "short")}
        </span>
      </div>
    </Link>
  );
}

// Card style with hover effect
function CardRelatedPost({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.imageAlt || post.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {post.category && (
          <span className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur text-primary-600 text-xs font-semibold rounded-full">
            {post.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-semibold text-lg text-concrete-800 group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-concrete-600 text-sm mt-2 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-concrete-100">
          <span className="text-sm text-concrete-500">
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span className="text-primary-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <FiArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// Sidebar numbered list
function SidebarRelatedPost({ post, index }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex items-start gap-3">
      <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm group-hover:bg-primary-500 group-hover:text-white transition-colors">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0 pt-1">
        <h4 className="text-concrete-700 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm leading-snug">
          {post.title}
        </h4>
      </div>
    </Link>
  );
}

// "Next/Previous" Post Navigation
export function PostNavigation({ previousPost, nextPost, className = "" }) {
  if (!previousPost && !nextPost) return null;

  return (
    <nav className={`border-t border-b border-concrete-200 py-8 ${className}`}>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Previous Post */}
        <div>
          {previousPost ? (
            <Link
              href={`/blog/${previousPost.slug}`}
              className="group flex flex-col h-full"
            >
              <span className="text-sm text-concrete-500 mb-2">
                ← Previous Article
              </span>
              <span className="font-heading font-semibold text-concrete-800 group-hover:text-primary-600 transition-colors">
                {previousPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Next Post */}
        <div className="text-right">
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex flex-col h-full items-end"
            >
              <span className="text-sm text-concrete-500 mb-2">
                Next Article →
              </span>
              <span className="font-heading font-semibold text-concrete-800 group-hover:text-primary-600 transition-colors">
                {nextPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </nav>
  );
}

// Posts by Same Author
export function AuthorPosts({ author, posts = [], className = "" }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className={`bg-concrete-50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        {author?.image ? (
          <Image
            src={author.image}
            alt={author.name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
            {author?.name?.charAt(0) || "A"}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-concrete-800">
            More from {author?.name || "this author"}
          </h3>
          <p className="text-sm text-concrete-500">{posts.length} articles</p>
        </div>
      </div>
      <div className="space-y-3">
        {posts.slice(0, 4).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block text-concrete-600 hover:text-primary-600 text-sm py-1"
          >
            • {post.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

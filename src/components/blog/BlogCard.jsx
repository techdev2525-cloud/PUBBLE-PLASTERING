// BlogCard Component
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FiClock, FiCalendar, FiArrowRight } from "react-icons/fi";
import { formatBlogDate } from "../../utils/dateFormatter";

export default function BlogCard({
  post,
  variant = "default",
  showExcerpt = true,
  showAuthor = true,
  className = "",
}) {
  const variants = {
    default: "flex-col",
    horizontal: "flex-col md:flex-row",
    featured: "flex-col",
    compact: "flex-row items-start gap-4",
  };

  const imageHeights = {
    default: "h-48",
    horizontal: "h-48 md:h-full md:w-72",
    featured: "h-64",
    compact: "h-20 w-20 flex-shrink-0",
  };

  return (
    <article
      className={`
        bg-white rounded-xl shadow-card overflow-hidden
        hover:shadow-card-hover transition-all duration-300
        ${variants[variant]}
        ${className}
      `}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={`block ${variants[variant]}`}
      >
        {/* Image */}
        <div className={`relative ${imageHeights[variant]}`}>
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-concrete-200 flex items-center justify-center">
              <span className="text-concrete-400 text-4xl">📝</span>
            </div>
          )}
          {/* Category Badge */}
          {post.category && variant !== "compact" && (
            <span className="absolute top-3 left-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {post.category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className={`p-5 flex-1 ${variant === "horizontal" ? "md:p-6" : ""}`}
        >
          {/* Tags */}
          {post.tags && post.tags.length > 0 && variant !== "compact" && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className={`
              font-heading font-semibold text-concrete-800 mb-2
              line-clamp-2 hover:text-primary-600 transition-colors
              ${variant === "featured" ? "text-2xl" : variant === "compact" ? "text-base" : "text-lg"}
            `}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          {showExcerpt && post.excerpt && variant !== "compact" && (
            <p className="text-concrete-500 line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div
            className={`
            flex items-center gap-4 text-sm text-concrete-400
            ${variant === "compact" ? "mt-1" : "mt-auto"}
          `}
          >
            <span className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              {post.readingTime} min read
            </span>
          </div>

          {/* Author */}
          {showAuthor && post.author && variant !== "compact" && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-concrete-100">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-primary-600 text-sm font-medium">
                    {post.author.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-sm text-concrete-600">
                {post.author.name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

// Featured Blog Card
export function FeaturedBlogCard({ post, className = "" }) {
  return (
    <article
      className={`relative rounded-2xl overflow-hidden group ${className}`}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Background Image */}
        <div className="relative h-[400px] md:h-[500px]">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-concrete-700" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          {/* Category */}
          {post.category && (
            <span className="inline-block bg-primary-500 px-4 py-1 rounded-full text-sm font-medium mb-4">
              {post.category.name}
            </span>
          )}

          {/* Title */}
          <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl mb-3 group-hover:text-primary-400 transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-white/80 line-clamp-2 mb-4 max-w-2xl">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-white/60">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
                <span>{post.author.name}</span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              {post.readingTime} min read
            </span>
          </div>

          {/* Read More */}
          <div className="flex items-center gap-2 mt-4 text-primary-400 font-medium group-hover:gap-4 transition-all">
            Read Article
            <FiArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Link>
    </article>
  );
}

// Mini Blog Card (for sidebar/related posts)
export function MiniBlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex gap-4 p-3 rounded-lg hover:bg-concrete-50 transition-colors"
    >
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-concrete-200 flex items-center justify-center">
            <span className="text-concrete-400">📝</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-concrete-800 line-clamp-2 hover:text-primary-600 transition-colors">
          {post.title}
        </h4>
        <p className="text-sm text-concrete-400 mt-1">
          {formatBlogDate(post.publishedAt)}
        </p>
      </div>
    </Link>
  );
}

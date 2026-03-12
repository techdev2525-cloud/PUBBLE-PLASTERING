// ProjectCard Component
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiCheck,
  FiClock,
} from "react-icons/fi";
import { formatDate } from "@/utils/dateFormatter";

export default function ProjectCard({
  project,
  variant = "default", // default, compact, featured, horizontal
  showStatus = true,
  className = "",
}) {
  if (!project) return null;

  const statusColors = {
    PLANNING: "bg-blue-100 text-blue-700",
    QUOTED: "bg-purple-100 text-purple-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    ON_HOLD: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    PLANNING: "Planning",
    QUOTED: "Quoted",
    IN_PROGRESS: "In Progress",
    ON_HOLD: "On Hold",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const mainImage =
    project.images?.[0]?.url || project.images?.[0] || project.featuredImage;

  const variants = {
    default: (
      <Link
        href={`/projects/${project.slug || project.id}`}
        className={`group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${className}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-concrete-100 to-concrete-200 flex items-center justify-center">
              <span className="text-4xl font-heading font-bold text-concrete-400">
                {project.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Status Badge */}
          {showStatus && project.status && (
            <span
              className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${statusColors[project.status] || "bg-concrete-100 text-concrete-700"}`}
            >
              {statusLabels[project.status] || project.status}
            </span>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-heading font-semibold text-lg text-concrete-800 group-hover:text-primary-600 transition-colors mb-2">
            {project.title}
          </h3>

          {project.description && (
            <p className="text-concrete-600 text-sm line-clamp-2 mb-3">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-concrete-500">
            {project.location && (
              <span className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4" />
                {project.location}
              </span>
            )}
            {(project.completedAt || project.startDate) && (
              <span className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                {formatDate(project.completedAt || project.startDate)}
              </span>
            )}
          </div>
        </div>
      </Link>
    ),

    compact: (
      <Link
        href={`/projects/${project.slug || project.id}`}
        className={`group flex items-center gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow ${className}`}
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={project.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-concrete-100" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-concrete-800 group-hover:text-primary-600 transition-colors truncate">
            {project.title}
          </h4>
          <div className="flex items-center gap-2 text-sm text-concrete-500 mt-1">
            {project.location && (
              <span className="flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {project.location}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        {showStatus && project.status && (
          <span
            className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded ${statusColors[project.status] || "bg-concrete-100"}`}
          >
            {statusLabels[project.status]}
          </span>
        )}
      </Link>
    ),

    featured: (
      <Link
        href={`/projects/${project.slug || project.id}`}
        className={`group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${className}`}
      >
        <div className="md:flex">
          {/* Image */}
          <div className="relative md:w-1/2 aspect-square md:aspect-auto">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={project.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200" />
            )}

            {/* Status */}
            {showStatus && project.status === "COMPLETED" && (
              <span className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>

          {/* Content */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            {project.category && (
              <span className="text-primary-600 font-semibold text-sm mb-2">
                {project.category}
              </span>
            )}

            <h2 className="font-heading font-bold text-2xl text-concrete-800 group-hover:text-primary-600 transition-colors mb-4">
              {project.title}
            </h2>

            {project.description && (
              <p className="text-concrete-600 mb-6 line-clamp-3">
                {project.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-concrete-500 mb-6">
              {project.location && (
                <span className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  {project.location}
                </span>
              )}
              {project.completedAt && (
                <span className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(project.completedAt)}
                </span>
              )}
              {project.duration && (
                <span className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  {project.duration}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
              View Project
              <FiArrowRight />
            </span>
          </div>
        </div>
      </Link>
    ),

    horizontal: (
      <Link
        href={`/projects/${project.slug || project.id}`}
        className={`group flex gap-6 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
      >
        {/* Image */}
        <div className="relative w-48 flex-shrink-0">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={project.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-concrete-100" />
          )}
        </div>

        {/* Content */}
        <div className="py-4 pr-4 flex flex-col justify-center">
          <h3 className="font-heading font-semibold text-lg text-concrete-800 group-hover:text-primary-600 transition-colors mb-1">
            {project.title}
          </h3>

          {project.description && (
            <p className="text-concrete-600 text-sm line-clamp-2 mb-2">
              {project.description}
            </p>
          )}

          <div className="flex gap-4 text-sm text-concrete-500">
            {project.location && (
              <span className="flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {project.location}
              </span>
            )}
            {showStatus && project.status && (
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[project.status]}`}
              >
                {statusLabels[project.status]}
              </span>
            )}
          </div>
        </div>
      </Link>
    ),
  };

  return variants[variant] || variants.default;
}

// Export variants as named exports
export function FeaturedProjectCard(props) {
  return <ProjectCard {...props} variant="featured" />;
}

export function CompactProjectCard(props) {
  return <ProjectCard {...props} variant="compact" />;
}

export function HorizontalProjectCard(props) {
  return <ProjectCard {...props} variant="horizontal" />;
}

// Skeleton loader
export function ProjectCardSkeleton({ variant = "default" }) {
  if (variant === "compact") {
    return (
      <div className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-lg">
        <div className="w-20 h-20 rounded-lg bg-concrete-200" />
        <div className="flex-1">
          <div className="h-4 bg-concrete-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-concrete-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="aspect-[4/3] bg-concrete-200" />
      <div className="p-5">
        <div className="h-5 bg-concrete-200 rounded w-3/4 mb-3" />
        <div className="h-3 bg-concrete-200 rounded w-full mb-2" />
        <div className="h-3 bg-concrete-200 rounded w-2/3 mb-4" />
        <div className="flex gap-3">
          <div className="h-3 bg-concrete-200 rounded w-20" />
          <div className="h-3 bg-concrete-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

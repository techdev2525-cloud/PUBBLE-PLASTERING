// Loader Component
import React from "react";

export default function Loader({
  size = "md",
  color = "primary",
  text,
  fullScreen = false,
}) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colors = {
    primary: "border-primary-500",
    white: "border-white",
    dark: "border-concrete-800",
  };

  const spinner = (
    <div
      className={`
        ${sizes[size]}
        border-4 border-concrete-200
        ${colors[color]}
        border-t-transparent
        rounded-full
        animate-spin
      `}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {spinner}
        {text && <p className="mt-4 text-concrete-600 font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {spinner}
      {text && <p className="mt-2 text-concrete-600 text-sm">{text}</p>}
    </div>
  );
}

// Page Loader for initial page loads
export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-200 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-xl font-heading font-semibold text-concrete-800">
          Pubble Plastering
        </h2>
        <p className="text-concrete-500 mt-1">Loading...</p>
      </div>
    </div>
  );
}

// Skeleton Loader for content placeholders
export function Skeleton({
  width = "100%",
  height = "1rem",
  rounded = "md",
  className = "",
}) {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={`
        bg-concrete-200 animate-pulse
        ${roundedClasses[rounded]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ imageHeight = 200 }) {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <Skeleton height={`${imageHeight}px`} rounded="none" />
      <div className="p-5 space-y-3">
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton height="1.25rem" />
        <Skeleton width="80%" height="1rem" />
        <Skeleton width="60%" height="1rem" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-concrete-100">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton width={`${60 + Math.random() * 40}%`} />
        </td>
      ))}
    </tr>
  );
}

// Blog Card Skeleton
export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <Skeleton height="200px" rounded="none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <Skeleton width="80px" height="24px" rounded="full" />
          <Skeleton width="60px" height="24px" rounded="full" />
        </div>
        <Skeleton height="1.5rem" />
        <Skeleton width="90%" />
        <Skeleton width="70%" />
        <div className="flex items-center gap-4 pt-2">
          <Skeleton width="32px" height="32px" rounded="full" />
          <Skeleton width="100px" />
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 flex items-center gap-4">
      <Skeleton width="48px" height="48px" rounded="lg" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height="0.875rem" />
        <Skeleton width="40%" height="1.5rem" />
      </div>
    </div>
  );
}

// Progress Loader
export function ProgressLoader({ progress = 0, showPercentage = true }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-concrete-600">
          Loading...
        </span>
        {showPercentage && (
          <span className="text-sm font-medium text-primary-600">
            {progress}%
          </span>
        )}
      </div>
      <div className="w-full bg-concrete-200 rounded-full h-2.5">
        <div
          className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Dots Loader
export function DotsLoader({ size = "md", color = "primary" }) {
  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const dotColors = {
    primary: "bg-primary-500",
    white: "bg-white",
    dark: "bg-concrete-800",
  };

  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${dotSizes[size]}
            ${dotColors[color]}
            rounded-full
            animate-bounce
          `}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

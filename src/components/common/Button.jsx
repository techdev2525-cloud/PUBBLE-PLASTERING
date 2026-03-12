// Button Component
import React from "react";
import Link from "next/link";

const variants = {
  primary:
    "bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg",
  secondary: "bg-concrete-700 hover:bg-concrete-800 text-white",
  outline:
    "border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white",
  ghost: "text-primary-500 hover:bg-primary-50",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  success: "bg-green-500 hover:bg-green-600 text-white",
  white: "bg-white hover:bg-gray-100 text-concrete-800 shadow-md",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const widthClasses = fullWidth ? "w-full" : "";

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses}
    ${sizeClasses}
    ${widthClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && iconPosition === "left" && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}

// Icon Button variant
export function IconButton({
  children,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}) {
  const iconSizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <Button
      variant={variant}
      className={`${iconSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

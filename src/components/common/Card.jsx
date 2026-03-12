// Card Component
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Card({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  hover = false,
  onClick,
  href,
  ...props
}) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-card",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const baseClasses = `
    bg-white rounded-xl
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${hover ? "transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1" : ""}
    ${onClick || href ? "cursor-pointer" : ""}
  `;

  const combinedClasses = `${baseClasses} ${className}`
    .trim()
    .replace(/\s+/g, " ");

  if (href) {
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <div className={combinedClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

// Card with Image Header
export function ImageCard({
  image,
  imageAlt = "",
  imageHeight = 200,
  title,
  subtitle,
  children,
  badge,
  href,
  className = "",
  ...props
}) {
  const Wrapper = href ? Link : "div";

  return (
    <Card
      padding="none"
      hover
      className={`overflow-hidden ${className}`}
      {...props}
    >
      <Wrapper href={href || "#"} className="block">
        <div className="relative" style={{ height: imageHeight }}>
          {image ? (
            <Image src={image} alt={imageAlt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-concrete-200 flex items-center justify-center">
              <span className="text-concrete-400">No image</span>
            </div>
          )}
          {badge && (
            <span className="absolute top-3 left-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {badge}
            </span>
          )}
        </div>
        <div className="p-5">
          {title && (
            <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-1 line-clamp-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-concrete-500 text-sm mb-3">{subtitle}</p>
          )}
          {children}
        </div>
      </Wrapper>
    </Card>
  );
}

// Stats Card for Dashboard
export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconBg = "bg-primary-100",
  iconColor = "text-primary-600",
}) {
  const changeColors = {
    positive: "text-green-600 bg-green-100",
    negative: "text-red-600 bg-red-100",
    neutral: "text-concrete-600 bg-concrete-100",
  };

  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <span className={`text-2xl ${iconColor}`}>{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-concrete-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-concrete-800">{value}</p>
      </div>
      {change && (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${changeColors[changeType]}`}
        >
          {change}
        </span>
      )}
    </Card>
  );
}

// Feature Card
export function FeatureCard({ icon, title, description, className = "" }) {
  return (
    <Card hover className={`text-center ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
        <span className="text-3xl text-primary-600">{icon}</span>
      </div>
      <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-2">
        {title}
      </h3>
      <p className="text-concrete-500">{description}</p>
    </Card>
  );
}

// Testimonial Card
export function TestimonialCard({ quote, author, role, avatar, rating }) {
  return (
    <Card className="relative">
      <div className="text-5xl text-primary-200 absolute top-4 left-4">"</div>
      <div className="relative z-10 pt-8">
        {rating && (
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < rating ? "text-yellow-400" : "text-concrete-200"}
              >
                ★
              </span>
            ))}
          </div>
        )}
        <p className="text-concrete-600 mb-6 italic">"{quote}"</p>
        <div className="flex items-center gap-3">
          {avatar && (
            <Image
              src={avatar}
              alt={author}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-concrete-800">{author}</p>
            {role && <p className="text-sm text-concrete-500">{role}</p>}
          </div>
        </div>
      </div>
    </Card>
  );
}

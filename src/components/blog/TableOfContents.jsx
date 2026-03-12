// Table of Contents Component for Blog Posts
import React, { useState, useEffect, useRef } from "react";
import { FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function TableOfContents({
  headings = [],
  className = "",
  title = "Table of Contents",
  collapsible = true,
  sticky = false,
  showNumbers = true,
}) {
  const [activeId, setActiveId] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const observerRef = useRef(null);

  // Track active heading with Intersection Observer
  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const handleObserver = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-100px 0px -66% 0px",
      threshold: 1.0,
    });

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      const yOffset = -100; // Offset for fixed header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  const content = (
    <nav className="toc-nav">
      <ul className="space-y-2">
        {headings.map((heading, index) => {
          const isActive = activeId === heading.id;
          const level = heading.level || 2;
          const indentClass = level === 3 ? "pl-4" : level === 4 ? "pl-8" : "";

          return (
            <li key={heading.id} className={indentClass}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`
                  w-full text-left py-1 px-3 rounded-md text-sm transition-all
                  ${
                    isActive
                      ? "bg-primary-50 text-primary-600 font-medium border-l-2 border-primary-500"
                      : "text-concrete-600 hover:text-concrete-800 hover:bg-concrete-50"
                  }
                `}
              >
                {showNumbers && (
                  <span className="text-concrete-400 mr-2">{index + 1}.</span>
                )}
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm p-5
        ${sticky ? "lg:sticky lg:top-24" : ""}
        ${className}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center justify-between mb-4
          ${collapsible ? "cursor-pointer" : ""}
        `}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
      >
        <h3 className="font-heading font-semibold text-lg text-concrete-800 flex items-center gap-2">
          <FiList className="w-5 h-5 text-primary-500" />
          {title}
        </h3>
        {collapsible && (
          <button className="p-1 rounded-md hover:bg-concrete-100">
            {isCollapsed ? (
              <FiChevronDown className="w-5 h-5 text-concrete-400" />
            ) : (
              <FiChevronUp className="w-5 h-5 text-concrete-400" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && content}
    </div>
  );
}

// Floating TOC for mobile
export function FloatingTOC({ headings = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const handleObserver = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "-100px 0px -66% 0px",
    });

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-primary-500 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
        aria-label="Table of Contents"
      >
        <div className="relative">
          <FiList className="w-6 h-6" />
          {/* Progress circle */}
          <svg className="absolute -inset-3 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${scrollProgress} 100`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-4 max-h-[60vh] bg-white rounded-xl shadow-2xl z-50 lg:hidden overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-concrete-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">Jump to Section</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-concrete-400 hover:text-concrete-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <ul className="space-y-2">
                {headings.map((heading, index) => {
                  const isActive = activeId === heading.id;
                  return (
                    <li key={heading.id}>
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={`
                          w-full text-left py-3 px-4 rounded-lg text-sm transition-all
                          ${
                            isActive
                              ? "bg-primary-50 text-primary-600 font-medium"
                              : "text-concrete-600 hover:bg-concrete-50"
                          }
                        `}
                      >
                        <span className="text-concrete-400 mr-2">
                          {index + 1}.
                        </span>
                        {heading.text}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Mini inline TOC (collapsible)
export function InlineTOC({ headings = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (headings.length === 0) return null;

  const displayHeadings = isExpanded ? headings : headings.slice(0, 3);

  return (
    <div className="bg-concrete-50 rounded-lg p-4 my-6">
      <h4 className="font-medium text-concrete-800 mb-2 flex items-center gap-2">
        <FiList className="w-4 h-4" />
        In this article:
      </h4>
      <ul className="space-y-1">
        {displayHeadings.map((heading, index) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="text-sm text-primary-600 hover:underline"
            >
              {index + 1}. {heading.text}
            </a>
          </li>
        ))}
      </ul>
      {headings.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-concrete-500 hover:text-concrete-700 mt-2"
        >
          {isExpanded ? "Show less" : `+ ${headings.length - 3} more sections`}
        </button>
      )}
    </div>
  );
}

// Utility function to extract headings from content
export function extractHeadings(content, levels = [2, 3]) {
  if (!content) return [];

  const headings = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");

  levels.forEach((level) => {
    const elements = doc.querySelectorAll(`h${level}`);
    elements.forEach((el) => {
      const id = el.id || slugify(el.textContent);
      headings.push({
        id,
        text: el.textContent,
        level,
      });
    });
  });

  return headings;
}

// Simple slugify for heading IDs
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

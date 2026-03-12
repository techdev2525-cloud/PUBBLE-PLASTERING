// Navbar Component
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { FiMenu, FiX, FiPhone, FiMail, FiClock } from "react-icons/fi";
import Button from "../common/Button";
import { siteSettings } from "../../config/siteSettings";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const topBarItems = [
  {
    icon: FiPhone,
    content: siteSettings.company.phone,
    href: `tel:${siteSettings.company.phone}`,
  },
  {
    icon: FiMail,
    content: siteSettings.company.email,
    href: `mailto:${siteSettings.company.email}`,
  },
  {
    icon: FiClock,
    content: `${siteSettings.company.businessHours.weekdays} Mon-Fri`,
    href: null,
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [router.pathname]);

  const isActive = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Bar - Train Marquee */}
      <div className="bg-concrete-800 text-white py-2 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap text-sm">
          {/* Duplicate the items twice for seamless looping */}
          {[...topBarItems, ...topBarItems].map((item, index) => {
            const Icon = item.icon;
            const content = (
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.content}
              </span>
            );
            return (
              <span key={index} className="inline-flex items-center mx-10">
                {item.href ? (
                  <a
                    href={item.href}
                    className="flex items-center gap-2 hover:text-primary-400 transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <span className="text-concrete-300">{content}</span>
                )}
                <span className="mx-10 text-concrete-500">•</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`
          sticky top-0 z-50
          transition-all duration-300
          ${isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"}
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo/pubble-logo.jpeg"
                  alt="Pubble Plastering Logo"
                  width={56}
                  height={56}
                  className="rounded-lg object-contain"
                  priority
                />
                <div className="hidden sm:block">
                  <h1 className="font-heading font-bold text-xl text-concrete-800">
                    Pubble Plastering
                  </h1>
                  <p className="text-xs text-concrete-500">
                    Professional Plastering
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      isActive(link.href)
                        ? "text-primary-600 bg-primary-50"
                        : "text-concrete-600 hover:text-primary-600 hover:bg-concrete-50"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Button & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Button
                href="/contact"
                variant="primary"
                size="md"
                className="hidden sm:flex"
              >
                Get Free Quote
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-concrete-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <FiX className="w-6 h-6 text-concrete-800" />
                ) : (
                  <FiMenu className="w-6 h-6 text-concrete-800" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            lg:hidden absolute top-full left-0 right-0
            bg-white shadow-lg
            transition-all duration-300 ease-in-out
            ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-3 rounded-lg font-medium transition-colors
                    ${
                      isActive(link.href)
                        ? "text-primary-600 bg-primary-50"
                        : "text-concrete-600 hover:text-primary-600 hover:bg-concrete-50"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-concrete-200" />
              <Button href="/contact" variant="primary" fullWidth>
                Get Free Quote
              </Button>
              <div className="flex flex-col gap-2 mt-4 text-sm text-concrete-500">
                <a
                  href={`tel:${siteSettings.company.phone}`}
                  className="flex items-center gap-2"
                >
                  <FiPhone className="w-4 h-4" />
                  {siteSettings.company.phone}
                </a>
                <a
                  href={`mailto:${siteSettings.company.email}`}
                  className="flex items-center gap-2"
                >
                  <FiMail className="w-4 h-4" />
                  {siteSettings.company.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-concrete-200 p-4 z-40 safe-area-inset-bottom">
        <div className="flex gap-3">
          <a
            href={`tel:${siteSettings.company.mobile}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-concrete-800 text-white rounded-lg font-semibold"
          >
            <FiPhone className="w-5 h-5" />
            Call Now
          </a>
          <Button href="/contact" variant="primary" className="flex-1">
            Free Quote
          </Button>
        </div>
      </div>
    </>
  );
}

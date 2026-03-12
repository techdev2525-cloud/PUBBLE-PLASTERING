// Footer Component
import React from "react";
import Link from "next/link";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
} from "react-icons/fi";
import { siteSettings } from "../../config/siteSettings";

const footerLinks = {
  services: [
    { href: "/services#plastering", label: "Plastering" },
    { href: "/services#rendering", label: "Rendering" },
    { href: "/services#skimming", label: "Skimming" },
    { href: "/services#dry-lining", label: "Dry Lining" },
    { href: "/services#coving", label: "Coving & Cornices" },
    { href: "/services#repairs", label: "Wall Repairs" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/projects", label: "Our Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  resources: [
    { href: "/blog/category/plastering-tips-advice", label: "Plastering Tips" },
    { href: "/blog/category/renovation-guides", label: "Renovation Guides" },
    {
      href: "/blog/category/diy-vs-professional",
      label: "DIY vs Professional",
    },
    { href: "/faq", label: "FAQs" },
  ],
};

const socialLinks = [
  { href: siteSettings.social.facebook, icon: FiFacebook, label: "Facebook" },
  {
    href: siteSettings.social.instagram,
    icon: FiInstagram,
    label: "Instagram",
  },
  { href: siteSettings.social.twitter, icon: FiTwitter, label: "Twitter" },
  { href: siteSettings.social.linkedin, icon: FiLinkedin, label: "LinkedIn" },
  { href: siteSettings.social.youtube, icon: FiYoutube, label: "YouTube" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-concrete-900 text-white pt-16 pb-24 lg:pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">PP</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">
                  Pubble Plastering
                </h3>
                <p className="text-sm text-concrete-400">
                  Professional Plastering
                </p>
              </div>
            </div>
            <p className="text-concrete-400 mb-6">
              {siteSettings.company.description}
            </p>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${siteSettings.company.phone}`}
                className="flex items-center gap-3 text-concrete-300 hover:text-primary-400 transition-colors"
              >
                <FiPhone className="w-5 h-5 text-primary-500" />
                {siteSettings.company.phone}
              </a>
              <a
                href={`mailto:${siteSettings.company.email}`}
                className="flex items-center gap-3 text-concrete-300 hover:text-primary-400 transition-colors"
              >
                <FiMail className="w-5 h-5 text-primary-500" />
                {siteSettings.company.email}
              </a>
              <div className="flex items-start gap-3 text-concrete-300">
                <FiMapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                <span>
                  {siteSettings.company.address.street}
                  <br />
                  {siteSettings.company.address.city},{" "}
                  {siteSettings.company.address.postcode}
                </span>
              </div>
              <div className="flex items-center gap-3 text-concrete-300">
                <FiClock className="w-5 h-5 text-primary-500" />
                {siteSettings.company.businessHours.weekdays}
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">
              Our Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-concrete-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-concrete-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">
              Stay Connected
            </h4>
            <p className="text-concrete-400 mb-4">
              Follow us for plastering tips, project updates, and more.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mb-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-concrete-800 flex items-center justify-center text-concrete-400 hover:bg-primary-500 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="space-y-2">
              <p className="text-sm text-concrete-500">Trusted & Verified</p>
              <div className="flex items-center gap-3 text-concrete-400 text-sm">
                <span className="flex items-center gap-1">✓ Fully Insured</span>
                <span className="flex items-center gap-1">✓ Free Quotes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-concrete-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-concrete-500 text-sm text-center lg:text-left">
              © {currentYear} {siteSettings.company.name}. All rights reserved.
              {siteSettings.company.companyNumber && (
                <span className="block lg:inline lg:ml-4">
                  Company No: {siteSettings.company.companyNumber}
                </span>
              )}
              {siteSettings.company.vatNumber && (
                <span className="block lg:inline lg:ml-4">
                  VAT No: {siteSettings.company.vatNumber}
                </span>
              )}
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-concrete-500 hover:text-primary-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-concrete-500 hover:text-primary-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-concrete-500 hover:text-primary-400 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Compact Footer for Admin Pages
export function CompactFooter() {
  return (
    <footer className="bg-white border-t border-concrete-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-concrete-500">
          <p>
            © {new Date().getFullYear()} {siteSettings.company.name}. All rights
            reserved.
          </p>
          <p>Admin Dashboard v1.0</p>
        </div>
      </div>
    </footer>
  );
}

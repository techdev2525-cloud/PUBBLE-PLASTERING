// About Page
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  FiAward,
  FiUsers,
  FiCheck,
  FiArrowRight,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteSettings } from "@/config/siteSettings";

export default function AboutPage() {
  const stats = [
    { value: "15+", label: "Years Experience" },
    { value: "500+", label: "Projects Completed" },
    { value: "100%", label: "Satisfaction Rate" },
    { value: "50+", label: "5-Star Reviews" },
  ];

  const values = [
    {
      title: "Quality Craftsmanship",
      description:
        "We never cut corners. Every project receives the same attention to detail and professional finish.",
    },
    {
      title: "Customer Focus",
      description:
        "Your satisfaction is our priority. We listen, communicate, and deliver exactly what you need.",
    },
    {
      title: "Reliability",
      description:
        "We show up when we say we will and finish on time. Your schedule matters to us.",
    },
    {
      title: "Fair Pricing",
      description:
        "Transparent quotes with no hidden costs. Quality work at competitive prices.",
    },
  ];

  return (
    <>
      <Head>
        <title>
          About Us | {siteSettings.company?.name || "Pubble Plastering"}
        </title>
        <meta
          name="description"
          content="Learn about Pubble Plastering - professional plastering services with over 15 years of experience serving homes and businesses across the UK."
        />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-concrete-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-primary-500 font-semibold">About Us</span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mt-2 mb-6">
                Professional Plastering with a Personal Touch
              </h1>
              <p className="text-xl text-concrete-300">
                We're a family-run plastering business dedicated to delivering
                exceptional quality and service on every project, big or small.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-8 bg-primary-500">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-heading font-bold text-3xl md:text-4xl text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary-600 font-semibold">
                  Our Story
                </span>
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-concrete-800 mt-2 mb-6">
                  Building Trust Since 2009
                </h2>
                <div className="space-y-4 text-concrete-600">
                  <p>
                    Pubble Plastering was founded with a simple mission: to
                    provide high-quality plastering services that homeowners and
                    businesses can rely on.
                  </p>
                  <p>
                    What started as a one-man operation has grown into a trusted
                    team of skilled plasterers, but our values remain the same.
                    We treat every property as if it were our own and every
                    customer like family.
                  </p>
                  <p>
                    Over the years, we've completed hundreds of projects across
                    the region, from small repair jobs to complete renovations.
                    Our reputation has been built on quality work, honest
                    pricing, and excellent customer service.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-concrete-100">
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    👷
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-primary-500 text-white rounded-xl p-6">
                  <div className="font-heading font-bold text-3xl">15+</div>
                  <div className="text-white/80">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-concrete-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary-600 font-semibold">Our Values</span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-concrete-800 mt-2 mb-4">
                What Sets Us Apart
              </h2>
              <p className="text-concrete-600 text-lg">
                Our commitment to these core values has earned us the trust of
                hundreds of satisfied customers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <FiCheck className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-concrete-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Qualifications */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      icon: "🏆",
                      title: "Fully Qualified",
                      desc: "NVQ Level 3 Plastering",
                    },
                    {
                      icon: "📋",
                      title: "Fully Insured",
                      desc: "Public Liability Insurance",
                    },
                    {
                      icon: "⭐",
                      title: "Highly Rated",
                      desc: "Checkatrade Approved",
                    },
                    {
                      icon: "🔒",
                      title: "DBS Checked",
                      desc: "Enhanced Background Check",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-concrete-50 rounded-xl p-6 text-center"
                    >
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className="font-semibold text-concrete-800">
                        {item.title}
                      </div>
                      <div className="text-sm text-concrete-600">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <span className="text-primary-600 font-semibold">
                  Qualifications
                </span>
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-concrete-800 mt-2 mb-6">
                  Qualified & Accredited
                </h2>
                <div className="space-y-4 text-concrete-600">
                  <p>
                    Our team holds professional qualifications and
                    accreditations that demonstrate our commitment to industry
                    standards and best practices.
                  </p>
                  <p>
                    We continuously invest in training and development to stay
                    up-to-date with the latest techniques, materials, and safety
                    regulations.
                  </p>
                  <p>
                    All our work is fully insured, giving you complete peace of
                    mind throughout your project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-concrete-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
              Ready to Work With Us?
            </h2>
            <p className="text-concrete-300 text-lg mb-8 max-w-2xl mx-auto">
              Get in touch today and discover why hundreds of customers trust
              Pubble Plastering with their homes and businesses.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                Get Free Quote
                <FiArrowRight />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// Home Page
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowRight,
  FiCheck,
  FiPhone,
  FiMail,
  FiStar,
  FiShield,
  FiClock,
  FiAward,
} from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuoteForm from "@/components/forms/QuoteForm";
import ProjectCard from "@/components/projects/ProjectCard";
import PhotoCarousel from "@/components/common/PhotoCarousel";
import { siteSettings } from "@/config/siteSettings";

export default function HomePage({ featuredProjects = [], testimonials = [] }) {
  return (
    <>
      <Head>
        <title>{siteSettings.seo.title}</title>
        <meta name="description" content={siteSettings.seo.description} />
        <meta name="keywords" content={siteSettings.seo.keywords} />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center">
          {/* Background Image */}
          <Image
            src="/images/hero-bg.png"
            alt="Professional plastering work in progress"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/25" />

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <span className="inline-block px-4 py-2 bg-primary-500/30 border border-primary-400/50 rounded-full text-primary-300 text-sm font-semibold mb-6">
                  Professional Plastering Services
                </span>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                  Quality Plastering That{" "}
                  <span className="text-primary-400">Transforms</span> Your
                  Space
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-lg">
                  Expert plastering and rendering services for homes and
                  businesses across the UK. Quality craftsmanship with over 15
                  years of experience.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
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

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-6 text-sm text-white/80">
                  <span className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    Free Quotes
                  </span>
                  <span className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    Fully Insured
                  </span>
                  <span className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    15+ Years Experience
                  </span>
                </div>
              </div>

              {/* Quick Quote Form */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <h2 className="font-heading font-bold text-2xl text-concrete-800 mb-2">
                  Request a Free Quote
                </h2>
                <p className="text-concrete-600 mb-6">
                  Tell us about your project and we'll get back to you within 24
                  hours.
                </p>
                <QuoteForm variant="compact" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary-600 font-semibold">
                Our Services
              </span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-concrete-800 mt-2 mb-4">
                Professional Plastering Solutions
              </h2>
              <p className="text-concrete-600 text-lg">
                From small repairs to complete renovations, we deliver
                exceptional results for every plastering project.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(siteSettings.services || [])
                .slice(0, 6)
                .map((service, index) => {
                  const bgImages = [
                    "/images/services/plastering1.webp",
                    "/images/services/wall%20rendering.jpg",
                    "/images/services/skimming%20plastering.webp",
                    "/images/services/Dry%20Lining.webp",
                    "/images/services/corving%20and%20cornice.webp",
                    "/images/services/wall%20repairs.webp",
                  ];
                  return (
                  <div
                    key={service.id || index}
                    className="group relative p-6 rounded-xl overflow-hidden min-h-[220px] flex flex-col justify-end transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                  >
                    {/* Background image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${bgImages[index % bgImages.length]})` }}
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-primary-900/85 group-hover:via-primary-800/60 group-hover:to-primary-700/30 transition-all duration-300" />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-white/30">
                        <span className="text-2xl text-white">
                          {service.icon || "🏗️"}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-xl text-white mb-2 drop-shadow-md">
                        {service.name}
                      </h3>
                      <p className="text-white/85 drop-shadow-sm">
                        {service.description ||
                          "Professional " +
                            service.name.toLowerCase() +
                            " services for residential and commercial properties."}
                      </p>
                    </div>
                  </div>
                  );
                })}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
              >
                View All Services
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-concrete-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary-600 font-semibold">
                  Why Choose Us
                </span>
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-concrete-800 mt-2 mb-6">
                  Trusted by Hundreds of Happy Customers
                </h2>
                <p className="text-concrete-600 text-lg mb-8">
                  We take pride in delivering exceptional plastering services
                  with attention to detail and customer satisfaction at the
                  heart of everything we do.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: FiAward,
                      title: "Expert Craftsmen",
                      desc: "Skilled plasterers with years of experience",
                    },
                    {
                      icon: FiShield,
                      title: "Fully Insured",
                      desc: "Complete peace of mind for every project",
                    },
                    {
                      icon: FiClock,
                      title: "On-Time Delivery",
                      desc: "We respect your time and deadlines",
                    },
                    {
                      icon: FiStar,
                      title: "Quality Guaranteed",
                      desc: "Premium materials and workmanship",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-concrete-800">
                          {item.title}
                        </h3>
                        <p className="text-concrete-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <PhotoCarousel
                    autoPlayInterval={4000}
                    showThumbnails={false}
                    aspectRatio="4/3"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects - Photo Carousel */}
        <section className="py-24 bg-gradient-to-b from-concrete-50 to-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full translate-x-1/3 translate-y-1/3" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-5 py-2 bg-primary-500/10 text-primary-600 font-bold text-base md:text-lg uppercase tracking-wider rounded-full mb-4">
                Our Work
              </span>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-concrete-900 mt-2 mb-6">
                Recent Projects
              </h2>
              <div className="w-20 h-1 bg-primary-500 mx-auto mb-6 rounded-full" />
              <p className="text-concrete-500 text-lg md:text-xl leading-relaxed">
                Take a look at some of our recent plastering work across
                residential and commercial properties.
              </p>
            </div>

            {/* Photo Carousel */}
            <PhotoCarousel
              photos={
                featuredProjects.length > 0
                  ? featuredProjects.map((project) => ({
                      id: project.id,
                      src:
                        project.images?.[0]?.url ||
                        project.featuredImage ||
                        null,
                      alt: project.title,
                      title: project.title,
                      description: project.description || project.excerpt,
                    }))
                  : undefined
              }
              autoPlay={true}
              autoPlayInterval={5000}
              showThumbnails={true}
              showControls={true}
              showInfo={true}
            />

            <div className="text-center mt-14">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary-500 text-white font-bold text-lg rounded-full hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                View All Projects
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
              Ready to Transform Your Space?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Get in touch today for a free, no-obligation quote. We're here to
              help bring your plastering project to life.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-concrete-100 transition-colors"
              >
                Get Free Quote
                <FiArrowRight />
              </Link>
              <a
                href={`tel:${siteSettings.company?.phone || ""}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                <FiPhone />
                Call Us Now
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// Server-side data fetching
export async function getStaticProps() {
  // In production, fetch from database
  return {
    props: {
      featuredProjects: [],
      testimonials: [],
    },
    revalidate: 3600, // Revalidate every hour
  };
}

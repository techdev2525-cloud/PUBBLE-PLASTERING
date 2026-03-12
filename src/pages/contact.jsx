// Contact Page
import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiMessageCircle,
} from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuoteForm from "@/components/forms/QuoteForm";
import { siteSettings } from "@/config/siteSettings";

export default function ContactPage() {
  const contactInfo = [
    {
      icon: FiPhone,
      title: "Phone",
      value: siteSettings.company?.phone || "07123 456789",
      link: `tel:${siteSettings.company?.phone || "07123456789"}`,
      description: "Mon-Fri 8am-6pm",
    },
    {
      icon: FiMail,
      title: "Email",
      value: siteSettings.company?.email || "info@pubbleplastering.co.uk",
      link: `mailto:${siteSettings.company?.email || "info@pubbleplastering.co.uk"}`,
      description: "We reply within 24 hours",
    },
    {
      icon: FiMapPin,
      title: "Location",
      value: "Serving the UK",
      description: "Based in Yorkshire",
    },
    {
      icon: FiClock,
      title: "Working Hours",
      value: "Mon - Sat",
      description: "8:00 AM - 6:00 PM",
    },
  ];

  const faqs = [
    {
      question: "How much does plastering cost?",
      answer:
        "Plastering costs vary depending on the size of the area, condition of walls, and type of finish required. We provide free, detailed quotes for every project.",
    },
    {
      question: "How long does plastering take?",
      answer:
        "A typical room can be plastered in 1-2 days. However, the plaster needs 2-3 days to dry before painting. We'll give you a timeline specific to your project.",
    },
    {
      question: "Do you offer free quotes?",
      answer:
        "Yes! We offer completely free, no-obligation quotes. We'll visit your property, assess the work needed, and provide a detailed written quote.",
    },
    {
      question: "Are you insured?",
      answer:
        "Yes, we carry full public liability insurance. This covers any accidental damage that may occur during our work on your property.",
    },
  ];

  return (
    <>
      <Head>
        <title>
          Contact Us | {siteSettings.company?.name || "Pubble Plastering"}
        </title>
        <meta
          name="description"
          content="Get in touch with Pubble Plastering for a free quote. Contact us by phone, email, or fill out our online form. We respond within 24 hours."
        />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-concrete-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-primary-500 font-semibold">Contact Us</span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mt-2 mb-6">
                Get Your Free Quote
              </h1>
              <p className="text-xl text-concrete-300">
                Have a plastering project in mind? Contact us today for a free,
                no-obligation quote. We're here to help.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="relative z-10 -mt-12 pb-8">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-concrete-800 mb-1">
                    {item.title}
                  </h3>
                  {item.link ? (
                    <a
                      href={item.link}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-concrete-800 font-medium">
                      {item.value}
                    </p>
                  )}
                  <p className="text-sm text-concrete-500 mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-concrete-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <div>
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-concrete-800 mb-2">
                  Request a Quote
                </h2>
                <p className="text-concrete-600 mb-8">
                  Fill out the form below and we'll get back to you within 24
                  hours with a detailed quote.
                </p>
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <QuoteForm />
                </div>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-concrete-800 mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-concrete-600 mb-8">
                  Got questions? Here are some answers to common queries.
                </p>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details
                      key={index}
                      className="bg-white rounded-xl shadow-sm group"
                    >
                      <summary className="p-6 cursor-pointer font-semibold text-concrete-800 flex items-center justify-between">
                        {faq.question}
                        <span className="text-concrete-400 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-concrete-600">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>

                {/* Additional Help */}
                <div className="mt-8 bg-primary-50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiMessageCircle className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-concrete-800 mb-1">
                        Need Help Deciding?
                      </h3>
                      <p className="text-concrete-600 text-sm mb-3">
                        Not sure what service you need? Give us a call and we'll
                        help you figure out the best solution.
                      </p>
                      <a
                        href={`tel:${siteSettings.company?.phone || ""}`}
                        className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline"
                      >
                        <FiPhone className="w-4 h-4" />
                        Call us now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section (Placeholder) */}
        <section className="bg-concrete-200 h-80">
          <div className="w-full h-full flex items-center justify-center text-concrete-500">
            <div className="text-center">
              <FiMapPin className="w-12 h-12 mx-auto mb-4" />
              <p>Map placeholder - Add Google Maps integration</p>
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="py-12 bg-orange-500">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="text-white">
                <h3 className="font-heading font-bold text-xl">
                  Emergency Repairs Needed?
                </h3>
                <p className="text-white/80">
                  We offer emergency call-out services for urgent plastering
                  repairs.
                </p>
              </div>
              <a
                href={`tel:${siteSettings.company?.phone || ""}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-concrete-100 transition-colors"
              >
                <FiPhone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

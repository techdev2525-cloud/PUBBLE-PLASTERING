// Services Page
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { FiArrowRight, FiCheck, FiPhone } from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteSettings } from "@/config/siteSettings";

export default function ServicesPage() {
  const services = [
    {
      id: "plastering",
      name: "Internal Plastering",
      icon: "🏠",
      description:
        "Professional internal plastering for walls and ceilings in residential and commercial properties.",
      features: [
        "Skim coating over existing surfaces",
        "New plaster application",
        "Ceiling plastering and repairs",
        "Smooth and textured finishes",
      ],
      image: "/images/services/plastering.jpg",
    },
    {
      id: "rendering",
      name: "External Rendering",
      icon: "🏗️",
      description:
        "Durable external rendering solutions to protect and enhance your property's exterior.",
      features: [
        "Sand and cement render",
        "Monocouche coloured render",
        "Silicone and acrylic renders",
        "K-rend systems",
      ],
      image: "/images/services/rendering.jpg",
    },
    {
      id: "drylining",
      name: "Dry Lining",
      icon: "📐",
      description:
        "Expert dry lining services for quick, clean wall construction and renovation.",
      features: [
        "Stud wall construction",
        "Dot and dab application",
        "Acoustic and thermal insulation",
        "Fire-rated systems",
      ],
      image: "/images/services/drylining.jpg",
    },
    {
      id: "skimming",
      name: "Skimming",
      icon: "✨",
      description:
        "Achieve a smooth, professional finish with our expert skimming services.",
      features: [
        "Skim over artex",
        "Plasterboard finishing",
        "Repair and re-skim",
        "Ultra-smooth finishes",
      ],
      image: "/images/services/skimming.jpg",
    },
    {
      id: "coving",
      name: "Coving & Cornices",
      icon: "🎨",
      description:
        "Add elegance to your rooms with professionally fitted coving and decorative cornices.",
      features: [
        "Standard and ornate coving",
        "Plaster cornices",
        "Ceiling roses",
        "Period property restoration",
      ],
      image: "/images/services/coving.jpg",
    },
    {
      id: "repairs",
      name: "Plaster Repairs",
      icon: "🔧",
      description:
        "Fast, reliable repair services for damaged plaster walls and ceilings.",
      features: [
        "Crack and hole repairs",
        "Water damage restoration",
        "Blown plaster repair",
        "Patch repairs",
      ],
      image: "/images/services/repairs.jpg",
    },
  ];

  return (
    <>
      <Head>
        <title>
          Our Services | {siteSettings.company?.name || "Pubble Plastering"}
        </title>
        <meta
          name="description"
          content="Professional plastering services including internal plastering, external rendering, dry lining, skimming, coving, and repairs. Free quotes available."
        />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-concrete-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-primary-500 font-semibold">
                Our Services
              </span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mt-2 mb-6">
                Professional Plastering Services
              </h1>
              <p className="text-xl text-concrete-300">
                From internal plastering to external rendering, we offer a
                comprehensive range of plastering services for residential and
                commercial properties.
              </p>
            </div>
          </div>
        </section>

        {/* Services List */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="space-y-20">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{service.icon}</span>
                      <h2 className="font-heading font-bold text-2xl md:text-3xl text-concrete-800">
                        {service.name}
                      </h2>
                    </div>
                    <p className="text-concrete-600 text-lg mb-6">
                      {service.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <FiCheck className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                          <span className="text-concrete-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/contact?service=${service.id}`}
                      className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
                    >
                      Get a Quote
                      <FiArrowRight />
                    </Link>
                  </div>

                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-concrete-100">
                      <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-concrete-100 to-concrete-200">
                        {service.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-concrete-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary-600 font-semibold">
                Our Process
              </span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-concrete-800 mt-2 mb-4">
                How We Work
              </h2>
              <p className="text-concrete-600 text-lg">
                Our straightforward process ensures a smooth experience from
                initial enquiry to project completion.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Get In Touch",
                  desc: "Contact us with details about your project",
                },
                {
                  step: "02",
                  title: "Free Quote",
                  desc: "We visit and provide a detailed, no-obligation quote",
                },
                {
                  step: "03",
                  title: "Schedule Work",
                  desc: "Once approved, we book in a convenient time",
                },
                {
                  step: "04",
                  title: "Expert Finish",
                  desc: "We complete the work to the highest standards",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-concrete-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
              Need a Plastering Quote?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Contact us today for a free, no-obligation quote. We'll assess
              your project and provide honest advice and competitive pricing.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-concrete-100 transition-colors"
              >
                Request Quote
                <FiArrowRight />
              </Link>
              <a
                href={`tel:${siteSettings.company?.phone || ""}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                <FiPhone />
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

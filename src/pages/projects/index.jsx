// Projects Page
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  FiFilter,
  FiGrid,
  FiList,
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteSettings } from "@/config/siteSettings";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const filters = [
    { id: "all", name: "All Projects" },
    { id: "residential", name: "Residential" },
    { id: "commercial", name: "Commercial" },
    { id: "renovation", name: "Renovation" },
    { id: "newbuild", name: "New Build" },
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects?publicOnly=true&limit=50");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter(
          (p) => (p.category || "").toLowerCase() === activeFilter,
        );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Head>
        <title>
          {"Our Projects | " +
            (siteSettings.company?.name || "Pubble Plastering")}
        </title>
        <meta
          name="description"
          content="Browse our portfolio of completed plastering projects. See examples of our work on residential, commercial, and renovation projects across the UK."
        />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-concrete-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-primary-500 font-semibold">Our Work</span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mt-2 mb-6">
                Project Portfolio
              </h1>
              <p className="text-xl text-concrete-300">
                Take a look at some of our recent plastering projects. From
                small repairs to large-scale commercial work, we deliver quality
                results every time.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-white border-b border-concrete-200 sticky top-0 z-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === filter.id
                        ? "bg-primary-500 text-white"
                        : "bg-concrete-100 text-concrete-600 hover:bg-concrete-200"
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-concrete-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 bg-concrete-50">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-16">
                <FiLoader className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : filteredProjects.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-6"
                }
              >
                {filteredProjects.map((project) => {
                  const imgUrl = project.images?.[0]?.url;
                  return viewMode === "list" ? (
                    <div
                      key={project.id}
                      className="flex gap-6 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-48 flex-shrink-0 bg-concrete-100">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="192px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-concrete-400">
                            <span className="text-3xl font-heading font-bold">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="py-4 pr-4 flex flex-col justify-center">
                        <h3 className="font-heading font-semibold text-lg text-concrete-800 mb-1">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-concrete-600 text-sm line-clamp-2 mb-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm text-concrete-500">
                          {project.location && (
                            <span className="flex items-center gap-1">
                              <FiMapPin className="w-3 h-3" />
                              {project.location}
                            </span>
                          )}
                          {project.completedAt && (
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              {formatDate(project.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={project.id}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-concrete-100">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl font-heading font-bold text-concrete-400">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-heading font-semibold text-lg text-concrete-800 group-hover:text-primary-600 transition-colors mb-2">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-concrete-600 text-sm line-clamp-2 mb-3">
                            {project.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-concrete-500">
                          {project.location && (
                            <span className="flex items-center gap-1">
                              <FiMapPin className="w-4 h-4" />
                              {project.location}
                            </span>
                          )}
                          {project.completedAt && (
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              {formatDate(project.completedAt)}
                            </span>
                          )}
                          {project.category && (
                            <span className="px-2 py-0.5 bg-concrete-100 rounded text-xs capitalize">
                              {project.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-concrete-500 text-lg">
                  No projects found in this category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-concrete-800 mb-4">
                Have a Project in Mind?
              </h2>
              <p className="text-concrete-600 text-lg mb-8">
                We&apos;d love to hear about your plastering project. Get in
                touch for a free consultation and quote.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                Start Your Project
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

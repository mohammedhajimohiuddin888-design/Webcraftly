import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Code2,
  FileText,
  PenTool,
  ShoppingCart,
  Bot,
  Search,
  Megaphone,
  Layers,
  ArrowRight,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { services, formatINR, type Service } from "@/lib/webcraftly";

export const Route = createFileRoute("/services/")({
  component: ServicesMarketplacePage,
});

function getServiceIcon(slug: string) {
  switch (slug) {
    case "website-development":
      return <Code2 className="size-6 text-[#0866D9]" />;
    case "content-development":
      return <FileText className="size-6 text-[#0866D9]" />;
    case "ui-ux-design":
      return <PenTool className="size-6 text-[#0866D9]" />;
    case "ecommerce-development":
      return <ShoppingCart className="size-6 text-[#0866D9]" />;
    case "ai-integration":
      return <Bot className="size-6 text-[#0866D9]" />;
    case "seo-optimization":
      return <Search className="size-6 text-[#0866D9]" />;
    case "digital-marketing":
      return <Megaphone className="size-6 text-[#0866D9]" />;
    case "web-applications":
      return <Layers className="size-6 text-[#0866D9]" />;
    default:
      return <Sparkles className="size-6 text-[#0866D9]" />;
  }
}

function ServicesMarketplacePage() {
  const [catalogServices, setCatalogServices] = useState<Service[]>(services);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOption, setSortOption] = useState<"featured" | "price-asc" | "price-desc">("featured");

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.services && data.services.length > 0) {
          setCatalogServices(data.services);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ["All", "Development", "Design", "Marketing", "AI & Systems"];

  const filteredServices = useMemo(() => {
    return catalogServices
      .filter((s) => {
        const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
        const matchesQuery =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.short.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.includes.some((inc) => inc.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortOption === "price-asc") return a.startingPrice - b.startingPrice;
        if (sortOption === "price-desc") return b.startingPrice - a.startingPrice;
        // default featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [searchQuery, selectedCategory, sortOption]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-mesh-gradient border-b border-[#0866D9]/15 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="brand-pill">Digital Service Marketplace</span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-[#071C55] tracking-tight">
              Explore Our Digital Solutions & Packages
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#667085] leading-relaxed">
              Discover and customize professional web development, design, and digital growth services. Every service includes tiered packages (Basic, Professional, Premium) with transparent pricing in Indian Rupees (₹).
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="sticky top-[69px] z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, technologies, or deliverables..."
                className="w-full rounded-full border border-gray-200 bg-[#F4F8FC] py-2 pl-10 pr-4 text-sm text-[#15233D] placeholder-[#667085] focus:border-[#0866D9] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0866D9]/20"
              />
            </div>

            {/* Category Pills & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-[#0866D9] text-white shadow-xs"
                        : "bg-gray-100 text-[#667085] hover:bg-gray-200 hover:text-[#071C55]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-1">
                <SlidersHorizontal className="size-4 text-[#667085]" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#071C55] focus:outline-hidden"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredServices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center">
              <h3 className="font-bold text-lg text-[#071C55]">No services match your search</h3>
              <p className="mt-1 text-sm text-[#667085]">
                Try adjusting your filters or search keywords.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 rounded-full bg-[#0866D9] px-5 py-2 text-xs font-bold text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <div
                  key={service.slug}
                  className={`group relative flex flex-col justify-between rounded-3xl border bg-white p-7 shadow-xs card-hover-effect ${
                    service.featured
                      ? "border-[#0866D9]/40 ring-1 ring-[#0866D9]/20"
                      : "border-gray-200"
                  }`}
                >
                  <div>
                    {/* Header: Icon & Category */}
                    <div className="flex items-center justify-between">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#EAF5FF] border border-[#0866D9]/20 transition-colors group-hover:bg-[#0866D9] group-hover:text-white">
                        {getServiceIcon(service.slug)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {service.featured && (
                          <span className="rounded-full bg-[#0866D9] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                            {service.badge}
                          </span>
                        )}
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-[#667085]">
                          3 Packages
                        </span>
                      </div>
                    </div>

                    {/* Title & Short */}
                    <h3 className="mt-6 font-extrabold text-xl text-[#071C55] group-hover:text-[#0866D9] transition-colors">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed line-clamp-3">
                      {service.short}
                    </p>

                    {/* Feature Highlights */}
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0866D9]">
                        Service Inclusions
                      </span>
                      <ul className="mt-2.5 space-y-2 text-xs text-[#15233D]">
                        {service.includes.slice(0, 4).map((inc, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-[#0866D9] shrink-0" />
                            <span className="truncate">{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech Badges */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {service.technologies.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-[#F4F8FC] px-2 py-0.5 text-[10px] font-medium text-[#071C55]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="mt-7 border-t border-gray-100 pt-5">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-[11px] text-[#667085] block">Starting from</span>
                        <span className="font-extrabold text-2xl text-[#071C55]">
                          {formatINR(service.startingPrice)}
                        </span>
                      </div>
                      <span className="text-xs text-[#0866D9] font-semibold">
                        Basic • Pro • Premium
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        className="inline-flex items-center justify-center rounded-xl border border-[#0866D9]/30 bg-white py-2.5 text-xs font-bold text-[#0866D9] hover:bg-[#EAF5FF] transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        className="inline-flex items-center justify-center rounded-xl bg-[#0866D9] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#071C55] transition-colors"
                      >
                        Choose Package
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Quote Help Section */}
      <section className="bg-[#EAF5FF]/60 border-t border-[#0866D9]/15 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h3 className="font-extrabold text-2xl text-[#071C55]">
            Need a Unique Specification or Enterprise Solution?
          </h3>
          <p className="mt-2 text-sm text-[#667085]">
            If your project requires customized milestones, custom API connectors, or multi-platform architectures, request a tailored quotation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/custom-quote"
              className="rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-[#071C55] transition-colors"
            >
              Request Custom Quote
            </Link>
            <a
              href="https://wa.me/919618890557?text=Hi%20WebCraftly,%20I%20have%20a%20custom%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#0866D9]/30 bg-white px-7 py-3 text-xs font-bold text-[#071C55] hover:bg-[#EAF5FF] transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

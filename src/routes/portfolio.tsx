import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Layers
} from "lucide-react";
import { portfolioItems, type PortfolioItem } from "@/lib/webcraftly";

export const Route = createFileRoute("/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const categories = ["All", "Websites", "E-commerce", "UI/UX", "Web Applications"];

  const filteredItems = portfolioItems.filter(
    (item) => selectedFilter === "All" || item.category === selectedFilter
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="bg-mesh-gradient border-b border-[#0866D9]/15 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="brand-pill">Engineered Results</span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-[#071C55] tracking-tight">
              Selected Work & Client Case Studies
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#667085] leading-relaxed">
              Explore how WebCraftly crafts custom websites, e-commerce storefronts, Figma design systems, and business web applications that drive real conversion growth.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-[69px] z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedFilter === cat
                    ? "bg-[#0866D9] text-white shadow-xs"
                    : "bg-gray-100 text-[#667085] hover:bg-gray-200 hover:text-[#071C55]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xs card-hover-effect"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#071C55] shadow-xs">
                        {item.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-xs ${
                          item.type === "Client Project"
                            ? "bg-[#0866D9] text-white"
                            : "bg-purple-600 text-white"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                      Client: {item.client}
                    </span>
                    <h3 className="mt-1 font-extrabold text-xl text-[#071C55] group-hover:text-[#0866D9] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Technologies tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-[#F4F8FC] px-2.5 py-0.5 text-[10px] font-semibold text-[#071C55]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                      Outcome
                    </span>
                    <span className="font-extrabold text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="size-3.5" /> {item.metrics}
                    </span>
                  </div>

                  <Link
                    to="/custom-quote"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0866D9] hover:underline"
                  >
                    Build Similar <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#EAF5FF]/60 border-t border-[#0866D9]/15 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h3 className="font-extrabold text-2xl text-[#071C55]">
            Have an Inspiring Project in Mind?
          </h3>
          <p className="mt-2 text-sm text-[#667085]">
            Let's discuss how we can engineer a custom digital experience tailored to your exact business goals.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/custom-quote"
              className="rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-[#071C55] transition-colors"
            >
              Start Your Project
            </Link>
            <Link
              to="/services"
              className="rounded-full border border-gray-200 bg-white px-7 py-3 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

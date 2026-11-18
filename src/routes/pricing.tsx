import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Zap
} from "lucide-react";
import { services, formatINR, type PackageTier, type Service } from "@/lib/webcraftly";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function PricingPage() {
  const [catalogServices, setCatalogServices] = useState<Service[]>(services);
  const [activeServiceSlug, setActiveServiceSlug] = useState<string>("website-development");

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

  const defaultService = services[0] as Service;
  const currentService =
    catalogServices.find((s) => s.slug === activeServiceSlug) ??
    catalogServices[0] ??
    defaultService;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="bg-mesh-gradient border-b border-[#0866D9]/15 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="brand-pill">Transparent Investment</span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-[#071C55] tracking-tight">
              Predictable Service Packages & Transparent Pricing
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#667085] leading-relaxed">
              No hidden agency retainers or surprise invoices. Select a service to compare Basic, Professional, and Premium packages with exact INR prices and delivery timelines.
            </p>
          </div>
        </div>
      </section>

      {/* Service Selector Tabs */}
      <section className="sticky top-[69px] z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {catalogServices.map((svc) => (
              <button
                key={svc.slug}
                onClick={() => setActiveServiceSlug(svc.slug)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  activeServiceSlug === svc.slug
                    ? "bg-[#0866D9] text-white shadow-xs"
                    : "bg-gray-100 text-[#667085] hover:bg-gray-200 hover:text-[#071C55]"
                }`}
              >
                {svc.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active Service Pricing Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071C55]">
              {currentService.name} Package Tiers
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#667085]">
              {currentService.short}
            </p>
          </div>

          {/* 3 Tier Pricing Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {(["Basic", "Professional", "Premium"] as PackageTier[]).map((tier) => {
              const pkg = currentService.packages[tier];
              return (
                <div
                  key={tier}
                  className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all ${
                    pkg.popular
                      ? "border-2 border-[#0866D9] bg-white shadow-xl shadow-blue-500/10 ring-4 ring-[#0866D9]/10"
                      : "border border-gray-200 bg-white hover:border-[#0866D9]/40 hover:shadow-md"
                  }`}
                >
                  <div>
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                        Most Popular Choice
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-xl text-[#071C55]">{pkg.name}</h3>
                      <span className="rounded-md bg-[#EAF5FF] px-2.5 py-0.5 text-xs font-bold text-[#0866D9]">
                        {pkg.tier}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[#667085] leading-relaxed min-h-[36px]">
                      {pkg.tagline}
                    </p>

                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#071C55]">
                        {formatINR(pkg.price)}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatINR(pkg.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[#667085] border-t border-b border-gray-100 py-2.5">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 text-[#0866D9]" /> {pkg.deliveryDays} Days
                      </span>
                      <span className="flex items-center gap-1">
                        <RotateCcw className="size-3.5 text-[#0866D9]" /> {pkg.revisions} Revisions
                      </span>
                    </div>

                    {/* Features List */}
                    <div className="mt-6 space-y-2.5 text-xs text-[#15233D]">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-[#0866D9] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <Link
                      to="/services/$slug"
                      params={{ slug: currentService.slug }}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                        pkg.popular
                          ? "bg-[#0866D9] text-white shadow-md shadow-blue-500/25 hover:bg-[#071C55]"
                          : "bg-[#EAF5FF] text-[#0866D9] hover:bg-[#0866D9] hover:text-white"
                      }`}
                    >
                      Select & Configure <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add-ons Preview */}
          <div className="mt-16 rounded-3xl border border-gray-200 bg-[#F4F8FC]/60 p-8">
            <h3 className="font-extrabold text-lg text-[#071C55] mb-4">
              Available Add-ons for {currentService.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentService.addOns.map((addon) => (
                <div
                  key={addon.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-xs flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-[#071C55]">{addon.name}</h4>
                    <span className="text-[11px] text-[#667085] line-clamp-1">{addon.description}</span>
                  </div>
                  <span className="font-extrabold text-[#0866D9] ml-2">
                    +{formatINR(addon.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

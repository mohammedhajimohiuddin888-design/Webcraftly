import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Zap,
  Target,
  Compass,
  MessageSquare,
  Phone
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="bg-mesh-gradient border-b border-[#0866D9]/15 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="brand-pill">About WebCraftly</span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-[#071C55] tracking-tight">
              Code. Craft. Connect.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#667085] leading-relaxed">
              "Turn your ideas into powerful websites and grow your online presence with WebCraftly." We bridge the gap between expensive legacy agencies and unstructured freelancers by offering a transparent, e-commerce service marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story & Mission */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="brand-pill">Who We Are</span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#071C55] tracking-tight">
                A Modern Digital Agency & Service Marketplace
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#667085] leading-relaxed">
                WebCraftly was established on a simple realization: small and growing businesses often struggle with vague proposals, hidden retainers, and unpredictable delivery timelines when hiring web developers.
              </p>
              <p className="mt-3 text-sm sm:text-base text-[#667085] leading-relaxed">
                We rebuilt the agency experience from the ground up as a service marketplace. Here, you browse fixed-scope packages with crystal-clear deliverables, configure add-ons dynamically, pay transparent Indian Rupee (₹) prices, and track your project milestones in real-time.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4">
                  <span className="font-black text-2xl text-[#0866D9]">100%</span>
                  <h4 className="font-bold text-sm text-[#071C55] mt-1">Direct Accountability</h4>
                  <p className="text-xs text-[#667085] mt-0.5">Direct WhatsApp communication with your technical lead</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4">
                  <span className="font-black text-2xl text-[#0866D9]">0%</span>
                  <h4 className="font-bold text-sm text-[#071C55] mt-1">Hidden Costs</h4>
                  <p className="text-xs text-[#667085] mt-0.5">Every package and optional add-on is fully priced upfront</p>
                </div>
              </div>
            </div>

            {/* Flyer / Visual Graphic Card */}
            <div className="relative rounded-3xl border border-[#0866D9]/20 bg-gradient-to-br from-[#EAF5FF] via-white to-blue-50 p-8 shadow-xl">
              <div className="flex items-center gap-4 pb-6 border-b border-[#0866D9]/15">
                <img
                  src="/webcraftly-logo.jpg"
                  alt="WebCraftly WC Logo"
                  className="size-14 rounded-2xl object-cover shadow-sm border border-[#0866D9]/20"
                />
                <div>
                  <h3 className="font-black text-2xl text-[#071C55]">WEB CRAFTLY</h3>
                  <span className="text-xs font-bold tracking-widest text-[#0866D9] uppercase">
                    Code. Craft. Connect.
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs text-[#15233D]">
                <div className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0866D9] text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#071C55]">Fast Delivery Guaranteed</h5>
                    <p className="text-[#667085]">Strict timeline milestones on every service tier.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#071C55] text-white">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#071C55]">Modern & Secure Architecture</h5>
                    <p className="text-[#667085]">React, Vite, Supabase, Tailwind, and SSL best practices.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#248BEE] text-white">
                    <HeartHandshake className="size-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#071C55]">100% Client Satisfaction</h5>
                    <p className="text-[#667085]">Dedicated post-launch warranty and revision periods.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#667085]">
                  <span>WhatsApp: </span>
                  <strong className="text-[#0866D9]">+91 96188 90557</strong>
                </div>
                <Link
                  to="/services"
                  className="rounded-full bg-[#0866D9] px-5 py-2 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
                >
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-[#F4F8FC]/60 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xs">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#0866D9] mb-4">
                <Target className="size-6" />
              </div>
              <h3 className="font-extrabold text-2xl text-[#071C55]">Our Mission</h3>
              <p className="mt-3 text-sm text-[#667085] leading-relaxed">
                To empower Indian entrepreneurs, professionals, and scaling brands with high-performance digital presence that converts visitors into customers, without bureaucratic overhead or inflated costs.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xs">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#0866D9] mb-4">
                <Compass className="size-6" />
              </div>
              <h3 className="font-extrabold text-2xl text-[#071C55]">Our Vision</h3>
              <p className="mt-3 text-sm text-[#667085] leading-relaxed">
                To be the most trusted and convenient digital solutions marketplace in India, where acquiring a corporate website, an e-commerce platform, or a custom AI workflow is as seamless and predictable as ordering a product online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Development Philosophy */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="brand-pill">Engineering Quality</span>
          <h2 className="mt-3 text-3xl font-extrabold text-[#071C55]">
            Our Development Philosophy
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
              <h4 className="font-bold text-base text-[#071C55]">1. User-First Design</h4>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Every screen is planned around user intention, readability, and immediate conversion action.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
              <h4 className="font-bold text-base text-[#071C55]">2. Clean Semantic Code</h4>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Zero bloat. Fast loading speeds under 2 seconds, SEO schema out of the box, and accessible markup.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
              <h4 className="font-bold text-base text-[#071C55]">3. Genuine Ownership</h4>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                You own 100% of your codebase, assets, and database credentials with no recurring lock-in traps.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

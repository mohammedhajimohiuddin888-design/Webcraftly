import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Layers,
  Megaphone,
  PenTool,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Users2,
  Bot,
  Zap,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  PackageCheck
} from "lucide-react";
import { useState } from "react";
import { services, portfolioItems, verifiedReviews, faqList, formatINR } from "@/lib/webcraftly";

export const Route = createFileRoute("/")({
  component: HomePage,
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

function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION (UI inspired by Reference 1 & 4 + Flyer colors) */}
      <section className="relative overflow-hidden bg-mesh-gradient border-b border-[#0866D9]/10 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0866D9]/25 bg-[#EAF5FF] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0866D9] shadow-xs">
                <span className="flex size-2 rounded-full bg-[#0866D9] animate-pulse" />
                WEB CRAFTLY • CODE. CRAFT. CONNECT.
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#071C55] leading-[1.12]">
                WE BUILD <span className="brand-gradient-text">DIGITAL EXPERIENCES</span> THAT GROW YOUR BUSINESS.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#667085] leading-relaxed max-w-2xl font-normal">
                From stunning websites to powerful web applications, WebCraftly transforms your ideas into digital solutions that make an impact. Discover, customize, and purchase digital services with full pricing transparency.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Explore Our Services <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/custom-quote"
                  className="inline-flex items-center gap-2 rounded-full border border-[#0866D9]/30 bg-white px-7 py-3.5 text-sm font-bold text-[#071C55] shadow-xs hover:bg-[#EAF5FF] hover:text-[#0866D9] hover:border-[#0866D9] transition-all"
                >
                  Start Your Project
                </Link>
              </div>

              {/* Direct Quick WhatsApp Connect */}
              <div className="mt-8 flex items-center gap-4 text-xs font-semibold text-[#15233D] pt-4 border-t border-gray-100 w-full sm:w-auto">
                <span className="text-[#667085]">Instant consultation:</span>
                <a
                  href="https://wa.me/919618890557?text=Hi%20WebCraftly,%20I'd%20like%20to%20discuss%20a%20project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#0866D9] hover:underline"
                >
                  <MessageSquare className="size-3.5" /> +91 96188 90557
                </a>
                <span className="text-gray-300">•</span>
                <span className="text-[#071C55]">+91 93467 58686</span>
              </div>
            </div>

            {/* Right Column: Premium Visual Composition (Modern Agency UI reference) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Card: Service Marketplace Preview */}
                <div className="rounded-3xl border border-[#0866D9]/20 bg-white p-5 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
                  {/* Mock Browser Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-red-400" />
                      <span className="size-2.5 rounded-full bg-amber-400" />
                      <span className="size-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="rounded-md bg-[#F4F8FC] px-3 py-1 text-[11px] font-semibold text-[#0866D9]">
                      webcraftly.com/services
                    </span>
                    <Sparkles className="size-3.5 text-[#0866D9]" />
                  </div>

                  {/* Simulated interactive service preview card */}
                  <div className="rounded-2xl bg-gradient-to-br from-[#EAF5FF]/80 to-white p-4 border border-[#0866D9]/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-white shadow-xs border border-[#0866D9]/20 text-[#0866D9]">
                          <Code2 className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#071C55]">Website Development</h4>
                          <span className="text-[10px] text-[#667085]">Growth Commercial Tier</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#0866D9] px-2.5 py-0.5 text-[11px] font-bold text-white">
                        ₹24,999
                      </span>
                    </div>

                    <div className="mt-3.5 space-y-1.5 text-[11px] text-[#15233D]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Up to 10 Custom Responsive Pages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Direct WhatsApp & Call Widget</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>On-Page SEO Optimization & Schema</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-[11px] font-semibold text-[#667085]">Turnaround: 10 Days</span>
                      <span className="text-xs font-bold text-[#0866D9] flex items-center gap-1">
                        Instant Checkout <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>

                  {/* Secondary items list */}
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                      <div className="text-[11px] font-bold text-[#071C55]">UI/UX Design</div>
                      <div className="text-[10px] text-[#667085]">From ₹7,499</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                      <div className="text-[11px] font-bold text-[#071C55]">E-commerce Store</div>
                      <div className="text-[10px] text-[#667085]">From ₹18,999</div>
                    </div>
                  </div>
                </div>

                {/* Floating Trust Badge (Bottom Right) */}
                <div className="absolute -bottom-6 -right-4 rounded-2xl border border-[#0866D9]/20 bg-white p-3.5 shadow-xl shadow-blue-500/10 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#0866D9]">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#071C55]">100% Satisfaction</div>
                    <div className="text-[10px] text-[#667085]">Full Project Guarantee</div>
                  </div>
                </div>

                {/* Floating Rating Pill (Top Left) */}
                <div className="absolute -top-4 -left-4 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 shadow-lg flex items-center gap-2">
                  <div className="flex text-amber-400">
                    <Star className="size-3.5 fill-current" />
                    <Star className="size-3.5 fill-current" />
                    <Star className="size-3.5 fill-current" />
                    <Star className="size-3.5 fill-current" />
                    <Star className="size-3.5 fill-current" />
                  </div>
                  <span className="text-xs font-extrabold text-[#071C55]">5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND BENEFITS / TRUST PILLARS (Direct from Pamphlet) */}
      <section className="border-b border-[#0866D9]/15 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4 transition-transform hover:-translate-y-1">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#0866D9] text-white shadow-md shadow-blue-500/20">
                <Zap className="size-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#071C55]">Fast Delivery</h4>
                <p className="text-xs text-[#667085] mt-0.5">Prompt milestones & strict deadline adherence</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4 transition-transform hover:-translate-y-1">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#071C55] text-white shadow-md">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#071C55]">Modern & Secure</h4>
                <p className="text-xs text-[#667085] mt-0.5">Clean semantic code & SSL compliance</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4 transition-transform hover:-translate-y-1">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#248BEE] text-white shadow-md">
                <Star className="size-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#071C55]">Affordable Pricing</h4>
                <p className="text-xs text-[#667085] mt-0.5">Transparent INR tiers with zero hidden fees</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4 transition-transform hover:-translate-y-1">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#0866D9] text-white shadow-md">
                <Users2 className="size-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#071C55]">100% Satisfaction</h4>
                <p className="text-xs text-[#667085] mt-0.5">Dedicated developer support & revisions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE OUR SERVICES (Marketplace Catalog Layout) */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F4F8FC]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="brand-pill">Service Marketplace</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
              Everything Your Business Needs to Grow Digitally.
            </h2>
            <p className="mt-3 text-base text-[#667085]">
              Browse our eight specialized digital services. Compare packages, select add-on options, and purchase your solution with predictable delivery times.
            </p>
          </div>

          {/* 8 Services Cards Grid */}
          <div className="mt-14 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.slug}
                className="group relative flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs card-hover-effect"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EAF5FF] border border-[#0866D9]/20 transition-colors group-hover:bg-[#0866D9] group-hover:text-white">
                      {getServiceIcon(service.slug)}
                    </div>
                    {service.featured ? (
                      <span className="rounded-full bg-[#0866D9] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        {service.badge}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-[#667085]">
                        {service.category}
                      </span>
                    )}
                  </div>

                  {/* Title & Short */}
                  <h3 className="mt-5 font-extrabold text-lg text-[#071C55] group-hover:text-[#0866D9] transition-colors">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#667085] line-clamp-2">
                    {service.short}
                  </p>

                  {/* Inclusions Highlights */}
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0866D9]">
                      Key Inclusions
                    </span>
                    <ul className="mt-2 space-y-1.5 text-xs text-[#15233D]">
                      {service.includes.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3 text-[#0866D9] shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs text-[#667085]">Starting at</span>
                    <span className="font-black text-lg text-[#071C55]">
                      {formatINR(service.startingPrice)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="inline-flex items-center justify-center rounded-xl border border-[#0866D9]/30 bg-white py-2 text-xs font-bold text-[#0866D9] hover:bg-[#EAF5FF] transition-colors"
                    >
                      Explore
                    </Link>
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="inline-flex items-center justify-center rounded-xl bg-[#0866D9] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#071C55] transition-colors"
                    >
                      View Packages
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-[#0866D9] bg-[#EAF5FF] px-8 py-3 text-sm font-bold text-[#0866D9] hover:bg-[#0866D9] hover:text-white transition-all shadow-xs"
            >
              View All Services & Filter Marketplace <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. THE SHOPPING EXPERIENCE WALKTHROUGH */}
      <section className="py-16 bg-[#071C55] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
              E-Commerce For Digital Services
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Ordering Works on WebCraftly
            </h2>
            <p className="mt-3 text-sm sm:text-base text-blue-200">
              A frictionless e-commerce buying experience designed specifically for professional digital services.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <span className="font-black text-3xl text-[#248BEE]">01</span>
              <h3 className="mt-3 font-bold text-lg text-white">Select Your Service</h3>
              <p className="mt-2 text-xs text-blue-200 leading-relaxed">
                Choose from Website Development, E-commerce, UI/UX, AI Integrations, SEO, and more.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <span className="font-black text-3xl text-[#248BEE]">02</span>
              <h3 className="mt-3 font-bold text-lg text-white">Compare Packages</h3>
              <p className="mt-2 text-xs text-blue-200 leading-relaxed">
                Pick Basic, Professional, or Premium. Toggle optional add-ons with dynamic live price calculation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <span className="font-black text-3xl text-[#248BEE]">03</span>
              <h3 className="mt-3 font-bold text-lg text-white">Add to Cart & Checkout</h3>
              <p className="mt-2 text-xs text-blue-200 leading-relaxed">
                Specify your project requirements, reference websites, and delivery timeline in our guided checkout.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <span className="font-black text-3xl text-[#248BEE]">04</span>
              <h3 className="mt-3 font-bold text-lg text-white">Track Order Progress</h3>
              <p className="mt-2 text-xs text-blue-200 leading-relaxed">
                Receive your unique Order ID and watch your project advance from Wireframe to Deployment in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW WE WORK (4-Step Timeline from Prompt) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="brand-pill">Our Proven Process</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
              From Concept to Launch in 4 Clear Steps
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-4 relative">
            <div className="flex flex-col items-start rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#0866D9] text-white font-extrabold text-lg">
                1
              </div>
              <h3 className="mt-5 font-bold text-lg text-[#071C55]">DISCOVER</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                We understand your exact business requirements, target audience, conversion goals, and technical specifications.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#071C55] text-white font-extrabold text-lg">
                2
              </div>
              <h3 className="mt-5 font-bold text-lg text-[#071C55]">DESIGN</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Create user-first interface wireframes, high-fidelity prototypes, and on-brand visual design systems in Figma.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#248BEE] text-white font-extrabold text-lg">
                3
              </div>
              <h3 className="mt-5 font-bold text-lg text-[#071C55]">DEVELOP</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Engineer clean, scalable code with sub-second page loads, mobile responsiveness, and seamless API integrations.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-lg">
                4
              </div>
              <h3 className="mt-5 font-bold text-lg text-[#071C55]">DELIVER</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Rigorous cross-device QA, live domain deployment, SEO verification, and ongoing warranty support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED WORK / PORTFOLIO PREVIEW */}
      <section className="py-20 bg-[#F4F8FC]/60 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="brand-pill">Client Showcases</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
                Real Digital Results Crafted by WebCraftly
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-[#0866D9] hover:underline"
            >
              View Full Portfolio <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {portfolioItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xs group card-hover-effect"
              >
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
                    <span className="rounded-full bg-[#0866D9] px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-extrabold text-lg text-[#071C55]">{item.title}</h3>
                  <p className="mt-2 text-xs text-[#667085] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs font-bold text-emerald-600">{item.metrics}</span>
                    <Link
                      to="/portfolio"
                      className="text-xs font-bold text-[#0866D9] hover:underline"
                    >
                      Case Study →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE WEBCRAFTLY */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="brand-pill">Why WebCraftly?</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight leading-tight">
                Designed to Deliver Measurable Commercial Growth, Not Just Pretty Pages.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#667085] leading-relaxed">
                Traditional agencies overcharge for bloat, while generic freelance marketplaces lack consistency and accountability. WebCraftly provides the best of both worlds: high-agency caliber engineering with transparent e-commerce packages and reliable Indian pricing.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-[#0866D9]">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#071C55]">Customized Solutions</h4>
                    <p className="text-xs text-[#667085]">Tailored around your specific industry, customer psychology, and workflow needs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-[#0866D9]">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#071C55]">Modern Technology Stack</h4>
                    <p className="text-xs text-[#667085]">React, Next.js, Supabase, Tailwind, and AI APIs ensuring speed and future-proof scaling.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-[#0866D9]">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#071C55]">Affordable Packages in INR</h4>
                    <p className="text-xs text-[#667085]">Clear pricing from ₹3,999 with zero hidden commissions or unannounced retainers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-[#0866D9]">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#071C55]">Dedicated Support & Warranty</h4>
                    <p className="text-xs text-[#667085]">Direct WhatsApp contact with your lead developer throughout the project and post-launch.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flyer Reference Showcase Card */}
            <div className="rounded-3xl border border-[#0866D9]/20 bg-gradient-to-br from-[#EAF5FF] via-white to-blue-50/50 p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-6 border-b border-[#0866D9]/15">
                <img
                  src="/webcraftly-logo.jpg"
                  alt="WebCraftly WC Mark"
                  className="size-12 rounded-2xl object-cover shadow-sm border border-[#0866D9]/20"
                />
                <div>
                  <h3 className="font-extrabold text-xl text-[#071C55]">WebCraftly Brand Promise</h3>
                  <span className="text-xs text-[#0866D9] font-bold tracking-wide">CODE. CRAFT. CONNECT.</span>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs text-[#15233D]">
                <div className="rounded-xl bg-white p-4 border border-gray-100 shadow-xs flex justify-between items-center">
                  <span className="font-semibold">Direct WhatsApp Access</span>
                  <span className="font-bold text-[#0866D9]">+91 96188 90557</span>
                </div>
                <div className="rounded-xl bg-white p-4 border border-gray-100 shadow-xs flex justify-between items-center">
                  <span className="font-semibold">Alternative Helpline</span>
                  <span className="font-bold text-[#0866D9]">+91 93467 58686</span>
                </div>
                <div className="rounded-xl bg-white p-4 border border-gray-100 shadow-xs flex justify-between items-center">
                  <span className="font-semibold">Client Inquiries Line</span>
                  <span className="font-bold text-[#0866D9]">+91 86397 11792</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/70 flex items-center justify-between">
                <span className="text-xs text-[#667085]">Let’s Build Something Great Together!</span>
                <Link
                  to="/custom-quote"
                  className="rounded-full bg-[#0866D9] px-5 py-2 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
                >
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. VERIFIED CUSTOMER TESTIMONIALS */}
      <section className="py-20 bg-[#F4F8FC]/50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="brand-pill">Client Reviews</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
              Trusted by Growing Businesses Across India
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-3">
            {verifiedReviews.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-7 shadow-xs card-hover-effect"
              >
                <div>
                  <div className="flex text-amber-400 gap-1 mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm italic text-[#15233D] leading-relaxed">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#071C55]">{rev.name}</h4>
                    <span className="text-xs text-[#667085]">
                      {rev.role}, {rev.company}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#0866D9] bg-[#EAF5FF] px-2 py-0.5 rounded-full">
                    {rev.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="brand-pill">Got Questions?</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-[#667085]">
              Everything you need to know about purchasing services and working with WebCraftly.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {faqList.slice(0, 6).map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#071C55] hover:text-[#0866D9] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="ml-4 text-xl font-light text-[#0866D9]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#667085] leading-relaxed border-t border-gray-100 bg-[#F4F8FC]/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link to="/faq" className="text-xs font-bold text-[#0866D9] hover:underline">
              View all 10+ FAQ answers →
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FINAL BOTTOM CTA BANNER */}
      <section className="bg-gradient-to-r from-[#0866D9] via-[#071C55] to-[#0866D9] py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Let's Build Something Great Together!
          </h2>
          <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Get your website today. Choose from our pre-configured packages or request a custom quotation tailored to your business needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/services"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#071C55] shadow-lg hover:bg-blue-50 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              to="/custom-quote"
              className="rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

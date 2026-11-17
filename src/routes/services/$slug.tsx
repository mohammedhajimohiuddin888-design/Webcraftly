import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  HelpCircle,
  Layers,
  Megaphone,
  PenTool,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Zap,
  Plus,
  Check,
  ChevronDown,
  Info
} from "lucide-react";
import { toast } from "sonner";
import {
  services,
  formatINR,
  addToCart,
  type PackageTier,
  type ServiceAddon
} from "@/lib/webcraftly";

export const Route = createFileRoute("/services/$slug")({
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const service = services.find((s) => s.slug === slug);

  // Default state for package selection and add-ons
  const [selectedTier, setSelectedTier] = useState<PackageTier>("Professional");
  const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>([]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (!service) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center px-4">
        <h1 className="text-3xl font-extrabold text-[#071C55]">Service Not Found</h1>
        <p className="mt-3 text-sm text-[#667085]">
          The requested service "{slug}" does not exist in our catalog.
        </p>
        <div className="mt-6">
          <Link
            to="/services"
            className="rounded-full bg-[#0866D9] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const currentPackage = service.packages[selectedTier];

  // Dynamic price calculation: Base Package + Selected Add-ons = Final Service Price
  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, item) => sum + item.price, 0);
  }, [selectedAddons]);

  const finalPrice = currentPackage.price + addonsTotal;

  const toggleAddon = (addon: ServiceAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    const addedItem = addToCart({
      serviceSlug: service.slug,
      serviceName: service.name,
      packageName: selectedTier,
      packagePrice: currentPackage.price,
      addOns: selectedAddons.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
      notes: customerNotes,
    });

    setTimeout(() => {
      setIsAdding(false);
      toast.success(`${service.name} (${selectedTier}) added to your cart!`, {
        description: `Total: ${formatINR(finalPrice)} (${selectedAddons.length} add-on${selectedAddons.length === 1 ? "" : "s"})`,
        action: {
          label: "View Cart",
          onClick: () => navigate({ to: "/cart" }),
        },
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO BREADCRUMB & INTRO */}
      <section className="bg-mesh-gradient border-b border-[#0866D9]/15 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
            <Link to="/" className="hover:text-[#0866D9]">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-[#0866D9]">Services</Link>
            <span>/</span>
            <span className="text-[#0866D9]">{service.name}</span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7">
              <span className="brand-pill">{service.category} Solution</span>
              <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-[#071C55] tracking-tight">
                {service.name}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#667085] leading-relaxed">
                {service.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#071C55]">
                <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 border border-gray-200 shadow-xs">
                  <Clock className="size-4 text-[#0866D9]" /> Standard: {currentPackage.deliveryDays} Days
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 border border-gray-200 shadow-xs">
                  <RotateCcw className="size-4 text-[#0866D9]" /> {currentPackage.revisions} Revisions
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 border border-gray-200 shadow-xs">
                  <ShieldCheck className="size-4 text-[#0866D9]" /> 100% Quality Assurance
                </span>
              </div>
            </div>

            {/* Quick Price Snapshot Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#0866D9]/25 bg-white p-7 shadow-xl shadow-blue-500/10">
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">
                  Configured Price
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-4xl font-black text-[#071C55]">
                    {formatINR(finalPrice)}
                  </span>
                  {currentPackage.originalPrice && (
                    <span className="text-sm font-semibold text-gray-400 line-through">
                      {formatINR(currentPackage.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#0866D9] font-medium">
                  Includes {selectedTier} Package {selectedAddons.length > 0 && `+ ${selectedAddons.length} Add-on(s)`}
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href="#packages"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0866D9] py-3 text-xs font-bold text-white shadow-md hover:bg-[#071C55] transition-colors"
                  >
                    Select & Customize Package <ArrowRight className="size-4" />
                  </a>
                  <Link
                    to="/custom-quote"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
                  >
                    Request Custom Quote Instead
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT IS INCLUDED & KEY BENEFITS */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* What is Included */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0866D9]">
                Scope of Work
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#071C55]">
                What Is Included in {service.name}
              </h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {service.includes.map((inc, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-[#F4F8FC] p-3.5"
                  >
                    <CheckCircle2 className="size-4 text-[#0866D9] shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-[#15233D]">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Benefits */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0866D9]">
                Business Value
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#071C55]">
                Why Choose This Solution?
              </h2>
              <div className="mt-6 space-y-3">
                {service.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-[#0866D9]/15 bg-white p-4 shadow-xs"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-[#0866D9]">
                      <Star className="size-3.5 fill-current" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#15233D] leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technologies Stack */}
          <div className="mt-14 rounded-2xl border border-gray-200 bg-[#F4F8FC]/60 p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Technologies & Frameworks We Use For This Service:
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {service.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-[#071C55] shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. PACKAGE SELECTION & DYNAMIC CALCULATOR */}
      <section id="packages" className="py-20 bg-gradient-to-b from-white to-[#F4F8FC]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="brand-pill">Step 1: Choose Your Package</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
              Select Your {service.name} Tier
            </h2>
            <p className="mt-3 text-sm text-[#667085]">
              All packages are complete end-to-end deliverables with clear timelines and revision allocations.
            </p>
          </div>

          {/* 3 Package Cards */}
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {(["Basic", "Professional", "Premium"] as PackageTier[]).map((tier) => {
              const pkg = service.packages[tier];
              const isSelected = selectedTier === tier;
              return (
                <div
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#0866D9] bg-white shadow-xl shadow-blue-500/10 ring-4 ring-[#0866D9]/10"
                      : "border border-gray-200 bg-white hover:border-[#0866D9]/40 hover:shadow-md"
                  }`}
                >
                  <div>
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                        Recommended Plan
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
                    <button
                      type="button"
                      className={`w-full rounded-xl py-3 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#0866D9] text-white shadow-md shadow-blue-500/25"
                          : "bg-gray-100 text-[#071C55] hover:bg-[#EAF5FF] hover:text-[#0866D9]"
                      }`}
                    >
                      {isSelected ? "✓ Selected Package" : "Select Package"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. PACKAGE COMPARISON TABLE */}
          <div className="mt-16 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="font-extrabold text-xl text-[#071C55] mb-6">
              Full Package Comparison Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[#071C55]">
                    <th className="pb-4 font-bold uppercase tracking-wider text-[#667085] w-1/3">Feature</th>
                    <th className="pb-4 font-extrabold text-center">Basic</th>
                    <th className="pb-4 font-extrabold text-center text-[#0866D9] bg-[#EAF5FF]/40 rounded-t-lg">Professional</th>
                    <th className="pb-4 font-extrabold text-center">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {service.comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3.5 font-semibold text-[#15233D]">{row.feature}</td>
                      <td className="py-3.5 text-center text-[#667085]">
                        {typeof row.basic === "boolean" ? (
                          row.basic ? <Check className="size-4 text-emerald-600 mx-auto" /> : <span className="text-gray-300">—</span>
                        ) : (
                          row.basic
                        )}
                      </td>
                      <td className="py-3.5 text-center font-bold text-[#0866D9] bg-[#EAF5FF]/30">
                        {typeof row.professional === "boolean" ? (
                          row.professional ? <Check className="size-4 text-emerald-600 mx-auto" /> : <span className="text-gray-300">—</span>
                        ) : (
                          row.professional
                        )}
                      </td>
                      <td className="py-3.5 text-center text-[#071C55] font-medium">
                        {typeof row.premium === "boolean" ? (
                          row.premium ? <Check className="size-4 text-emerald-600 mx-auto" /> : <span className="text-gray-300">—</span>
                        ) : (
                          row.premium
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. CUSTOMIZABLE ADD-ONS & INTERACTIVE CALCULATOR */}
          <div className="mt-16 rounded-3xl border border-[#0866D9]/20 bg-white p-7 sm:p-9 shadow-md">
            <div className="max-w-2xl">
              <span className="brand-pill">Step 2: Optional Customizations</span>
              <h3 className="mt-3 text-2xl font-extrabold text-[#071C55]">
                Customize Your Package With Add-ons
              </h3>
              <p className="mt-1 text-xs text-[#667085]">
                Only add what your project truly requires. Prices automatically update below.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {service.addOns.map((addon) => {
                const isSelected = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`flex items-start justify-between gap-4 rounded-2xl border p-4.5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#0866D9] bg-[#EAF5FF]/50 ring-2 ring-[#0866D9]/20 shadow-xs"
                        : "border-gray-200 bg-white hover:border-[#0866D9]/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? "bg-[#0866D9] border-[#0866D9] text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="size-3.5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#071C55]">{addon.name}</h4>
                        <p className="mt-0.5 text-xs text-[#667085] leading-relaxed">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-[#0866D9] whitespace-nowrap">
                      +{formatINR(addon.price)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Special Instructions / Brief Input */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <label htmlFor="customer-notes" className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-2">
                Special Requirements or Project Notes (Optional)
              </label>
              <textarea
                id="customer-notes"
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="E.g. We have existing brand colors #1A365D, need site finished before June 15th..."
                className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#15233D] placeholder-[#667085] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Step 3: Interactive Total & Add to Cart Action Bar */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#071C55] to-[#0866D9] p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                  Step 3: Review Total & Add to Cart
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    {formatINR(finalPrice)}
                  </span>
                  <span className="text-xs text-blue-200">
                    ({selectedTier} Plan {addonsTotal > 0 && `+ ${formatINR(addonsTotal)} add-ons`})
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80 mt-1">
                  Estimated delivery in {currentPackage.deliveryDays} business days with {currentPackage.revisions} revision rounds.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-black text-[#071C55] shadow-lg hover:bg-blue-50 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <ShoppingCart className="size-4 text-[#0866D9]" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
                <Link
                  to="/cart"
                  className="rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                >
                  Go to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROJECT DELIVERY PROCESS (4 Steps) */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="brand-pill">How It Happens</span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#071C55]">
              Delivery Process for {service.name}
            </h3>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((p, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6">
                <span className="font-black text-2xl text-[#0866D9]">{p.step}</span>
                <h4 className="mt-3 font-bold text-base text-[#071C55]">{p.title}</h4>
                <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  HelpCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartStorageKey, parseCart, services, formatINR } from "@/lib/webcraftly";

const navigation = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Our Work", to: "/portfolio" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function announceCartChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("webcraftly-cart-change"));
  }
}

export function SiteHeader() {
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const updateCount = () => {
      const items = parseCart(window.localStorage.getItem(cartStorageKey));
      setCount(items.length);
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("webcraftly-cart-change", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("webcraftly-cart-change", updateCount);
    };
  }, []);

  const matches = search.trim()
    ? services.filter((item) =>
        `${item.name} ${item.short} ${item.category}`.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-[#0866D9]/20 bg-gradient-to-r from-[#EAF5FF]/98 via-[#E2F0FE]/98 to-[#EAF5FF]/98 backdrop-blur-md transition-all shadow-xs">
      {/* Top micro-bar with quick contact info from pamphlet */}
      <div className="hidden border-b border-[#0866D9]/15 bg-[#0866D9]/8 px-4 py-1.5 text-xs text-[#071C55] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-bold text-[#0866D9]">
              <Sparkles className="size-3.5 text-[#0866D9]" /> Code. Craft. Connect.
            </span>
            <span className="text-[#071C55]/70 font-medium">Premium Digital Agency & Service Marketplace</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://wa.me/919618890557?text=Hi%20WebCraftly,%20I%20am%20interested%20in%20your%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-bold text-[#071C55] hover:text-[#0866D9] transition-colors"
            >
              <MessageSquare className="size-3 text-[#0866D9]" /> WhatsApp: +91 96188 90557
            </a>
            <span className="text-[#0866D9]/30">|</span>
            <a
              href="tel:+919346758686"
              className="flex items-center gap-1.5 font-semibold text-[#071C55] hover:text-[#0866D9] transition-colors"
            >
              <Phone className="size-3 text-[#0866D9]" /> +91 93467 58686
            </a>
            <span className="text-[#0866D9]/30">|</span>
            <Link to="/orders" className="text-[#0866D9] hover:underline font-bold">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="WebCraftly Home">
          <div className="relative size-10 overflow-hidden rounded-xl border border-[#0866D9]/30 bg-white shadow-xs transition-transform group-hover:scale-105">
            <img
              src="/webcraftly-logo.jpg"
              alt="WebCraftly WC Logo"
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Fallback stylized mark */}
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#0866D9] to-[#071C55] text-white font-black text-sm">
              WC
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#071C55] leading-none">
              WEB <span className="text-[#0866D9]">CRAFTLY</span>
            </span>
            <span className="text-[9.5px] font-bold tracking-[0.16em] text-[#0866D9] uppercase mt-0.5">
              Code. Craft. Connect.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 lg:flex rounded-full bg-white/70 p-1 border border-[#0866D9]/15 shadow-2xs" aria-label="Main Navigation">
          {navigation.map((item) => {
            const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#0866D9] text-white shadow-xs"
                    : "text-[#071C55] hover:text-[#0866D9] hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search Services"
            className="rounded-full p-2 text-[#071C55] bg-white/70 border border-[#0866D9]/15 hover:bg-white hover:text-[#0866D9] transition-all shadow-2xs"
          >
            {searchOpen ? <X className="size-4.5" /> : <Search className="size-4.5" />}
          </button>

          {/* Account Icon */}
          <Link
            to="/account"
            aria-label="Customer Account"
            className="rounded-full p-2 text-[#071C55] bg-white/70 border border-[#0866D9]/15 hover:bg-white hover:text-[#0866D9] transition-all shadow-2xs"
          >
            <UserRound className="size-4.5" />
          </Link>

          {/* Shopping Cart Icon with Live Badge */}
          <Link
            to="/cart"
            aria-label={`Shopping Cart, ${count} items`}
            className="relative rounded-full p-2 text-[#071C55] bg-white/70 border border-[#0866D9]/15 hover:bg-white hover:text-[#0866D9] transition-all shadow-2xs"
          >
            <ShoppingBag className="size-4.5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#0866D9] text-[11px] font-bold text-white shadow-xs ring-2 ring-white animate-in zoom-in-75">
                {count}
              </span>
            )}
          </Link>

          {/* Primary Action Button */}
          <Link
            to="/custom-quote"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition-opacity"
          >
            Start Project <ArrowRight className="size-3.5" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            className="rounded-xl p-2 text-[#071C55] bg-white/70 border border-[#0866D9]/15 hover:bg-white lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Search Overlay Drawer */}
      {searchOpen && (
        <div className="border-t border-[#0866D9]/20 bg-[#EAF5FF]/95 backdrop-blur-md px-4 py-4 sm:px-6 shadow-md animate-in slide-in-from-top-2">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#0866D9]" />
              <input
                id="site-search"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services (e.g. Website Development, E-commerce, UI/UX, AI, SEO)..."
                className="w-full rounded-xl border border-[#0866D9]/30 bg-white py-2.5 pl-10 pr-4 text-sm text-[#15233D] placeholder-[#667085] focus:border-[#0866D9] focus:outline-hidden focus:ring-2 focus:ring-[#0866D9]/20 shadow-xs"
              />
            </div>
            {search.trim() && (
              <div className="mt-3 rounded-xl border border-[#0866D9]/20 bg-white p-2 shadow-sm">
                {matches.length > 0 ? (
                  matches.map((service) => (
                    <Link
                      key={service.slug}
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearch("");
                      }}
                      className="flex items-center justify-between rounded-lg p-2.5 hover:bg-[#EAF5FF] transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm text-[#071C55]">{service.name}</div>
                        <div className="text-xs text-[#667085] line-clamp-1">{service.short}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0866D9]">
                          From {formatINR(service.startingPrice)}
                        </span>
                        <ChevronRight className="size-4 text-[#667085]" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-center text-sm text-[#667085]">
                    No services found matching "{search}".
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <nav className="border-t border-[#0866D9]/20 bg-[#EAF5FF]/98 backdrop-blur-md px-4 py-4 lg:hidden animate-in slide-in-from-top-1">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                    isActive ? "bg-[#0866D9] text-white shadow-xs" : "text-[#071C55] hover:bg-white"
                  }`}
                >
                  {item.label}
                  <ChevronRight className={`size-4 ${isActive ? "text-white" : "text-[#667085]"}`} />
                </Link>
              );
            })}
            <div className="mt-3 pt-3 border-t border-[#0866D9]/15 flex flex-col gap-2">
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-[#071C55] font-bold"
              >
                <Clock className="size-4 text-[#0866D9]" /> Track My Order
              </Link>
              <Link
                to="/custom-quote"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0866D9] py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20"
              >
                Start Your Project <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#0866D9]/15 bg-[#071C55] text-white">
      {/* Pre-footer Callout Banner */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#0866D9]/30 via-[#248BEE]/20 to-transparent py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
              Ready to Turn Your Ideas Into Powerful Digital Solutions?
            </h3>
            <p className="mt-1.5 text-blue-200 text-sm max-w-xl">
              Select your package online, request a custom quote, or connect with our team on WhatsApp today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/services"
              className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#071C55] hover:bg-blue-50 transition-colors shadow-md"
            >
              Explore Services
            </Link>
            <a
              href="https://wa.me/919618890557?text=Hi%20WebCraftly,%20let's%20discuss%20a%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-600/30 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600/50 transition-colors"
            >
              <MessageSquare className="size-3.5 text-blue-300" /> WhatsApp Direct
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="size-10 overflow-hidden rounded-xl border border-white/20 bg-white">
                <img
                  src="/webcraftly-logo.jpg"
                  alt="WebCraftly WC Logo"
                  className="size-full object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  WEB <span className="text-[#248BEE]">CRAFTLY</span>
                </span>
                <span className="block text-[9.5px] font-bold tracking-[0.16em] text-blue-200 uppercase">
                  Code. Craft. Connect.
                </span>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100/80">
              "Turn your ideas into powerful websites and grow your online presence with WebCraftly."
            </p>

            <div className="mt-6 flex flex-col gap-2 text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-[#248BEE]" />
                <span>WhatsApp: +91 96188 90557 / +91 93467 58686</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-[#248BEE]" />
                <span>Direct Line: +91 86397 11792</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-blue-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#248BEE]" /> 100% Satisfaction
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#248BEE]" /> Secure Checkout
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Our Services</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-blue-200/90">
              <li><Link to="/services/$slug" params={{ slug: "website-development" }} className="hover:text-white transition-colors">Website Development</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "content-development" }} className="hover:text-white transition-colors">Content Development</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "ui-ux-design" }} className="hover:text-white transition-colors">UI/UX Design</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "ecommerce-development" }} className="hover:text-white transition-colors">E-commerce Solutions</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "ai-integration" }} className="hover:text-white transition-colors">AI Integration</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "seo-optimization" }} className="hover:text-white transition-colors">SEO Optimization</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "digital-marketing" }} className="hover:text-white transition-colors">Digital Marketing</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "web-applications" }} className="hover:text-white transition-colors">Web Applications</Link></li>
            </ul>
          </div>

          {/* Col 3: Marketplace & Client */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Client Portal</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-blue-200/90">
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">Order Checkout</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Project Status</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Customer Dashboard</Link></li>
              <li><Link to="/custom-quote" className="hover:text-white transition-colors">Request Custom Quote</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Package Comparison</Link></li>
              <li><Link to="/admin" className="hover:text-white text-blue-400 font-medium transition-colors">Admin Workspace</Link></li>
            </ul>
          </div>

          {/* Col 4: Agency & Legal */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Company</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-blue-200/90">
              <li><Link to="/about" className="hover:text-white transition-colors">About WebCraftly</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Our Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300 gap-4">
          <p>© {new Date().getFullYear()} WebCraftly. Code. Craft. Connect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/faq" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

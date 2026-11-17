import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ShoppingBag,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import {
  cartStorageKey,
  parseCart,
  removeFromCart,
  clearCart,
  formatINR,
  type CartItem
} from "@/lib/webcraftly";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const loadCart = () => {
    if (typeof window !== "undefined") {
      setItems(parseCart(window.localStorage.getItem(cartStorageKey)));
    }
  };

  useEffect(() => {
    loadCart();
    const handleUpdate = () => loadCart();
    window.addEventListener("webcraftly-cart-change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("webcraftly-cart-change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleRemove = (id: string, name: string) => {
    removeFromCart(id);
    toast.info(`Removed ${name} from your cart.`);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "WELCOME10" || code === "WEBCRAFT10") {
      setDiscountPercent(10);
      setAppliedCode(code);
      toast.success("Coupon code applied! 10% discount activated.");
    } else if (code === "GROWTH15") {
      setDiscountPercent(15);
      setAppliedCode(code);
      toast.success("Coupon code applied! 15% discount activated.");
    } else {
      toast.error("Invalid coupon code. Try WELCOME10 for 10% off.");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-screen bg-[#F4F8FC]/50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title & Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
            <Link to="/" className="hover:text-[#0866D9]">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-[#0866D9]">Services</Link>
            <span>/</span>
            <span className="text-[#0866D9]">Shopping Cart</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
            Your Service Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-[#667085]">
            Review your selected digital services, configure project requirements, and proceed to checkout.
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-xs max-w-2xl mx-auto my-12">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[#EAF5FF] text-[#0866D9]">
              <ShoppingBag className="size-10" />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-[#071C55]">
              Your Cart is Currently Empty
            </h2>
            <p className="mt-2 text-sm text-[#667085] max-w-md mx-auto">
              Explore our services catalog to compare packages, customize optional add-ons, and start your digital project.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-[#071C55] transition-colors"
              >
                Explore Services <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/custom-quote"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
              >
                Request Custom Quote
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  {items.length} Service{items.length > 1 ? "s" : ""} in Cart
                </span>
                <button
                  onClick={() => {
                    clearCart();
                    toast.info("Cart cleared.");
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-full bg-[#0866D9] px-3 py-0.5 text-[10px] font-extrabold uppercase text-white tracking-wide">
                          {item.packageName} Plan
                        </span>
                        <h3 className="font-extrabold text-lg text-[#071C55]">
                          {item.serviceName}
                        </h3>
                      </div>
                      <span className="text-xs text-[#667085] mt-1 block">
                        Base Plan: {formatINR(item.packagePrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-2xl text-[#071C55]">
                        {formatINR(item.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Add-ons List if any */}
                  {item.addOns.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-[#F4F8FC] p-3.5 border border-gray-100">
                      <span className="text-[11px] font-bold text-[#0866D9] uppercase tracking-wider block mb-2">
                        Included Add-ons ({item.addOns.length}):
                      </span>
                      <div className="space-y-1.5">
                        {item.addOns.map((addon) => (
                          <div
                            key={addon.id}
                            className="flex items-center justify-between text-xs text-[#15233D]"
                          >
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              {addon.name}
                            </span>
                            <span className="font-semibold text-[#071C55]">
                              +{formatINR(addon.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Notes if provided */}
                  {item.notes && (
                    <div className="mt-3 text-xs text-[#667085] italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <strong>Notes:</strong> "{item.notes}"
                    </div>
                  )}

                  {/* Actions: Edit Configuration or Remove */}
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <Link
                      to="/services/$slug"
                      params={{ slug: item.serviceSlug }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0866D9] hover:underline"
                    >
                      <Edit3 className="size-3.5" /> Modify Package & Add-ons
                    </Link>

                    <button
                      onClick={() => handleRemove(item.id, item.serviceName)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0866D9] hover:underline"
                >
                  <ArrowLeft className="size-4" /> Continue Shopping for More Services
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Action */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-3xl border border-[#0866D9]/20 bg-white p-7 shadow-xl shadow-blue-500/10">
                <h3 className="font-extrabold text-xl text-[#071C55] mb-4">
                  Order Summary
                </h3>

                {/* Pricing Line Items */}
                <div className="space-y-3 text-xs text-[#15233D] pb-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Subtotal ({items.length} items)</span>
                    <span className="font-bold text-[#071C55]">{formatINR(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="size-3" /> Discount ({appliedCode} - {discountPercent}%)
                      </span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Marketplace Service Fee</span>
                    <span className="font-semibold text-emerald-600">₹0 (Free)</span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="mt-5 pb-5 border-b border-gray-100">
                  <label htmlFor="coupon" className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
                    Promo / Referral Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 rounded-xl border border-gray-200 bg-[#F4F8FC] px-3 py-2 text-xs uppercase font-semibold text-[#071C55] placeholder-[#667085] focus:border-[#0866D9] focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#0866D9] px-4 py-2 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <span className="mt-1.5 block text-[10px] text-[#667085]">
                    Hint: Use code <strong>WELCOME10</strong> for 10% off your initial order!
                  </span>
                </form>

                {/* Final Total */}
                <div className="mt-5 flex items-baseline justify-between">
                  <span className="font-bold text-sm text-[#071C55]">Estimated Total</span>
                  <span className="font-black text-3xl text-[#0866D9]">
                    {formatINR(finalTotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <div className="mt-6 space-y-3">
                  <Link
                    to="/checkout"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] py-4 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    Proceed to Project Checkout <ArrowRight className="size-4" />
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#667085] text-center pt-2">
                    <ShieldCheck className="size-4 text-[#0866D9]" />
                    <span>Razorpay & Secure UPI Verified Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

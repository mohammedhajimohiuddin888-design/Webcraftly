import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  cartStorageKey,
  parseCart,
  clearCart,
  saveOrder,
  formatINR,
  type CartItem,
  type Order
} from "@/lib/webcraftly";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State: Step 1 Customer Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");

  // Form State: Step 2 Project Requirements
  const [projectDescription, setProjectDescription] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [requiredFeatures, setRequiredFeatures] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState("Standard Timeline");

  // Form State: Step 4 Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp_manual" | "upi_transfer" | "bank_wire">("whatsapp_manual");
  const [paymentReference, setPaymentReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cart = parseCart(window.localStorage.getItem(cartStorageKey));
      setItems(cart);
    }

    // Pre-fill user profile if logged in
    fetch("/api/auth/get-session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          if (data.user.name) setFullName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
          if (data.user.businessName) setBusinessName(data.user.businessName);
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalTotal = subtotal;

  // Validation before advancing steps
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectDescription.trim()) {
      toast.error("Please provide a brief description of your project goals.");
      return;
    }
    setStep(3);
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          customerBusinessName: businessName.trim() || undefined,
          projectDescription: projectDescription.trim(),
          referenceUrl: referenceUrl.trim() || undefined,
          requiredFeatures: requiredFeatures.trim() || undefined,
          specialInstructions: specialInstructions.trim() || undefined,
          deliveryTimeline,
          items: items.map((i) => ({
            serviceSlug: i.serviceSlug,
            serviceName: i.serviceName,
            packageName: i.packageName,
            packagePrice: i.packagePrice,
            addOns: i.addOns,
            notes: i.notes,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Failed to create order");
      }

      clearCart();
      setConfirmedOrder(data.order);
      setWhatsappUrl(data.whatsappUrl);
      setStep(5);
      toast.success("Order registered successfully!", {
        description: `Order ID: ${data.order.id}. Connect via WhatsApp to confirm kickoff.`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to submit order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step !== 5) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center px-4">
        <h2 className="text-2xl font-extrabold text-[#071C55]">No Services in Cart</h2>
        <p className="mt-2 text-sm text-[#667085]">
          Add a service package to your cart before proceeding to checkout.
        </p>
        <Link
          to="/services"
          className="mt-6 inline-flex rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
        >
          Explore Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC]/50 py-12 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <span className="brand-pill">Secure Project Checkout</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
            Finalize Your Digital Service Order
          </h1>

          {/* Stepper Wizard Bar */}
          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold">
            <span
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
                step >= 1 ? "bg-[#0866D9] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              1. Contact Info
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
                step >= 2 ? "bg-[#0866D9] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2. Requirements
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
                step >= 3 ? "bg-[#0866D9] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              3. Review
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
                step >= 4 ? "bg-[#0866D9] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              4. Payment
            </span>
          </div>
        </div>

        {/* STEP 1: CUSTOMER INFORMATION */}
        {step === 1 && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-xl font-extrabold text-[#071C55] mb-2">
              Step 1: Your Contact Information
            </h2>
            <p className="text-xs text-[#667085] mb-6">
              We use these details for your project deliverables, updates, and invoice.
            </p>

            <form onSubmit={handleNextFromStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@company.com"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Company / Brand Name (Optional)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sharma Enterprises"
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Link to="/cart" className="text-xs font-semibold text-[#0866D9] hover:underline">
                  ← Back to Cart
                </Link>
                <button
                  type="submit"
                  className="rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
                >
                  Continue to Requirements →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PROJECT REQUIREMENTS & BRIEF */}
        {step === 2 && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-xl font-extrabold text-[#071C55] mb-2">
              Step 2: Project Specifications & Scope
            </h2>
            <p className="text-xs text-[#667085] mb-6">
              Give our engineers the details necessary to deliver your vision accurately.
            </p>

            <form onSubmit={handleNextFromStep2} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Project Description & Core Goal *
                </label>
                <textarea
                  required
                  rows={4}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Explain what your business does and what you want this website/service to accomplish..."
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Reference Website or Inspiration URL (Optional)
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://example.com/competitor-or-inspiration"
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Required Functionality / Features (Optional)
                </label>
                <textarea
                  rows={2}
                  value={requiredFeatures}
                  onChange={(e) => setRequiredFeatures(e.target.value)}
                  placeholder="E.g. WhatsApp integration, blog articles CMS, dark mode accents..."
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Preferred Delivery Timeline
                </label>
                <select
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden font-semibold"
                >
                  <option value="Standard Timeline">Standard Delivery Timeline (as specified per package)</option>
                  <option value="Urgent (72 Hours Sprint)">Urgent Priority Sprint (as per express add-on)</option>
                  <option value="Flexible (Within 30 Days)">Flexible (Within 30 Days)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#667085] hover:text-[#071C55]"
                >
                  ← Back to Contact Info
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
                >
                  Review Order Summary →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: ORDER REVIEW */}
        {step === 3 && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-xl font-extrabold text-[#071C55] mb-2">
              Step 3: Review Your Order
            </h2>
            <p className="text-xs text-[#667085] mb-6">
              Verify your purchased packages, contact info, and specifications before completing payment.
            </p>

            {/* Selected items breakdown */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#071C55]">
                        {item.serviceName}
                      </h4>
                      <span className="text-xs font-semibold text-[#0866D9]">
                        {item.packageName} Tier
                      </span>
                    </div>
                    <span className="font-black text-base text-[#071C55]">
                      {formatINR(item.totalPrice)}
                    </span>
                  </div>

                  {item.addOns.length > 0 && (
                    <div className="mt-2 text-[11px] text-[#667085] space-y-0.5">
                      {item.addOns.map((a) => (
                        <div key={a.id} className="flex justify-between">
                          <span>• {a.name}</span>
                          <span>+{formatINR(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Customer & Brief recap */}
            <div className="rounded-2xl border border-gray-200 p-4 text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-[#667085]">Customer:</span>
                <span className="font-bold text-[#071C55]">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Email:</span>
                <span className="font-bold text-[#071C55]">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Brief:</span>
                <span className="text-[#15233D] font-medium text-right line-clamp-2 max-w-xs">
                  {projectDescription}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-b border-gray-200 py-4 flex items-baseline justify-between mb-6">
              <span className="font-extrabold text-base text-[#071C55]">Total Payable Amount</span>
              <span className="font-black text-3xl text-[#0866D9]">
                {formatINR(finalTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-[#667085] hover:text-[#071C55]"
              >
                ← Back to Requirements
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
              >
                Select Payment Method →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT OPTIONS */}
        {step === 4 && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-xl font-extrabold text-[#071C55] mb-2">
              Step 4: Confirm Order & Payment Workflow
            </h2>
            <p className="text-xs text-[#667085] mb-6">
              WebCraftly works with transparent WhatsApp-assisted commerce. Discuss custom milestones, verify deliverables, and settle payment directly with our team.
            </p>

            <div className="space-y-4 mb-6">
              {/* Option 1: WhatsApp Assisted Commerce */}
              <div
                onClick={() => setPaymentMethod("whatsapp_manual")}
                className="rounded-2xl border border-emerald-500 bg-emerald-50/50 p-5 cursor-pointer ring-2 ring-emerald-500/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                      <MessageSquare className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#071C55]">
                          Order via WhatsApp & Discuss Payment
                        </h4>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Official Workflow
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] mt-1">
                        Connect directly with our team (+91 96188 05557) to finalize delivery milestones, confirm scope, and receive verified payment instructions.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-800">
                        <span className="rounded-md bg-white/80 border border-emerald-200 px-2 py-1">✓ Instant UPI (GPay/PhonePe/Paytm)</span>
                        <span className="rounded-md bg-white/80 border border-emerald-200 px-2 py-1">✓ Bank IMPS / NEFT</span>
                        <span className="rounded-md bg-white/80 border border-emerald-200 px-2 py-1">✓ Milestone Sprints</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F4F8FC] p-4 text-xs text-[#667085] flex items-center gap-2.5 mb-6">
              <ShieldCheck className="size-4 text-[#0866D9] shrink-0" />
              <span>
                Your order is safely recorded in our Neon database before opening WhatsApp. All payment records are verified into your append-only client ledger.
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-semibold text-[#667085] hover:text-[#071C55]"
              >
                ← Back to Review
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompleteOrder}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <MessageSquare className="size-4" />
                {isProcessing ? "Saving Order..." : `Order via WhatsApp (${formatINR(finalTotal)})`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ORDER CONFIRMATION */}
        {step === 5 && confirmedOrder && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-xl text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="size-10" />
            </div>

            <span className="brand-pill mt-6">Order Registered</span>
            <h2 className="mt-3 text-3xl font-extrabold text-[#071C55]">
              Order Successfully Placed!
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Your project order has been recorded in Neon PostgreSQL. Click below to connect on WhatsApp to confirm payment and schedule kickoff.
            </p>

            {/* Order Details Card */}
            <div className="mt-8 rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6 text-left text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-[#667085]">Order Reference:</span>
                <span className="font-black text-base text-[#0866D9] font-mono">
                  {confirmedOrder.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Client Name:</span>
                <span className="font-bold text-[#071C55]">
                  {confirmedOrder.customerName || confirmedOrder.customer?.fullName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Verified Total:</span>
                <span className="font-black text-base text-[#071C55]">{formatINR(confirmedOrder.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Order Status:</span>
                <span className="rounded-full bg-amber-100 px-3 py-0.5 font-bold text-amber-800">
                  {confirmedOrder.status || "Pending Confirmation"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Payment Status:</span>
                <span className="rounded-full bg-blue-100 px-3 py-0.5 font-bold text-[#0866D9]">
                  {confirmedOrder.paymentStatus || "Awaiting Payment"}
                </span>
              </div>
            </div>

            {/* Continue to WhatsApp Button */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={whatsappUrl || `https://wa.me/919618805557?text=Hi%20WebCraftly,%20I%20have%20submitted%20order%20${confirmedOrder.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-emerald-600/40 transition-all"
              >
                <MessageSquare className="size-4" />
                Continue to WhatsApp (+91 96188 05557)
              </a>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3.5 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
              >
                Track Order Live
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-[#667085]">
              Direct founder line:{" "}
              <a
                href="https://wa.me/919618805557"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0866D9] font-bold hover:underline"
              >
                +91 96188 05557
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

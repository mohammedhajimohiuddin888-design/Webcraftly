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
  ExternalLink
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
  const [paymentMethod, setPaymentMethod] = useState<"upi_transfer" | "razorpay" | "bank_wire">("upi_transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cart = parseCart(window.localStorage.getItem(cartStorageKey));
      setItems(cart);
    }
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

  const handleCompleteOrder = () => {
    setIsProcessing(true);

    const uniqueOrderId = `WC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: uniqueOrderId,
      createdAt: new Date().toISOString(),
      status: "Confirmed",
      customer: {
        fullName,
        email,
        phone,
        businessName: businessName || undefined,
      },
      requirements: {
        projectDescription,
        referenceUrl: referenceUrl || undefined,
        requiredFeatures: requiredFeatures || undefined,
        specialInstructions: specialInstructions || undefined,
        deliveryTimeline,
      },
      items,
      subtotal,
      discount: 0,
      total: finalTotal,
      paymentMethod,
      paymentStatus: "Verified",
      paymentReference: paymentReference || `VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setTimeout(() => {
      saveOrder(newOrder);
      clearCart();
      setConfirmedOrder(newOrder);
      setIsProcessing(false);
      setStep(5);
      toast.success("Order confirmed successfully!", {
        description: `Order ID: ${uniqueOrderId}. Our team has received your specifications.`,
      });
    }, 800);
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
              Step 4: Select Payment Method
            </h2>
            <p className="text-xs text-[#667085] mb-6">
              Choose your preferred payment method in Indian Rupees (₹).
            </p>

            <div className="space-y-3 mb-6">
              {/* Option 1: Direct UPI / QR Code */}
              <div
                onClick={() => setPaymentMethod("upi_transfer")}
                className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
                  paymentMethod === "upi_transfer"
                    ? "border-[#0866D9] bg-[#EAF5FF]/60 ring-2 ring-[#0866D9]/20"
                    : "border-gray-200 bg-white hover:border-[#0866D9]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <QrCode className="size-5 text-[#0866D9]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#071C55]">
                        Instant UPI & QR Code (Google Pay, PhonePe, Paytm)
                      </h4>
                      <p className="text-xs text-[#667085]">
                        Direct transfer to official WebCraftly UPI ID with immediate receipt
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Zero Gateway Fees</span>
                </div>

                {paymentMethod === "upi_transfer" && (
                  <div className="mt-4 border-t border-blue-200/50 pt-3 text-xs space-y-2">
                    <div className="rounded-xl bg-white p-3 border border-blue-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#667085] uppercase tracking-wider block">Official WebCraftly UPI ID</span>
                        <span className="font-black text-sm text-[#0866D9]">webcraftly@icici</span>
                      </div>
                      <span className="text-xs font-semibold text-[#071C55]">WhatsApp: +91 96188 90557</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#071C55] mb-1">
                        UPI Transaction ID / UTR Number (Optional for instant record)
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="e.g. 41298402910"
                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-[#071C55]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Razorpay Gateway Mode */}
              <div
                onClick={() => setPaymentMethod("razorpay")}
                className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-[#0866D9] bg-[#EAF5FF]/60 ring-2 ring-[#0866D9]/20"
                    : "border-gray-200 bg-white hover:border-[#0866D9]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-5 text-[#0866D9]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#071C55]">
                        Razorpay Gateway (Credit/Debit Card, Netbanking, EMI)
                      </h4>
                      <p className="text-xs text-[#667085]">
                        Secure card and internet banking processing via Razorpay
                      </p>
                    </div>
                  </div>
                </div>

                {paymentMethod === "razorpay" && (
                  <div className="mt-4 border-t border-blue-200/50 pt-3 text-xs text-[#667085]">
                    <p>
                      Orders processed through Razorpay Sandbox/Live environment. You will receive an official digital invoice immediately after checkout confirmation.
                    </p>
                  </div>
                )}
              </div>

              {/* Option 3: Corporate Bank Wire / NEFT */}
              <div
                onClick={() => setPaymentMethod("bank_wire")}
                className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
                  paymentMethod === "bank_wire"
                    ? "border-[#0866D9] bg-[#EAF5FF]/60 ring-2 ring-[#0866D9]/20"
                    : "border-gray-200 bg-white hover:border-[#0866D9]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-[#0866D9]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#071C55]">
                        Bank Wire / NEFT / RTGS (Corporate Billing)
                      </h4>
                      <p className="text-xs text-[#667085]">
                        Proforma invoice generated for company account settlement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F4F8FC] p-4 text-xs text-[#667085] flex items-center gap-2.5 mb-6">
              <ShieldCheck className="size-4 text-[#0866D9] shrink-0" />
              <span>
                All projects are backed by WebCraftly's 100% Client Satisfaction Guarantee and scheduled delivery milestones.
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
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <Lock className="size-3.5" />
                {isProcessing ? "Confirming Order..." : `Pay & Confirm Order (${formatINR(finalTotal)})`}
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

            <span className="brand-pill mt-6">Order Confirmed</span>
            <h2 className="mt-3 text-3xl font-extrabold text-[#071C55]">
              Thank You For Your Order!
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Your project order has been verified and registered with WebCraftly.
            </p>

            {/* Order Details Card */}
            <div className="mt-8 rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6 text-left text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-[#667085]">Order ID:</span>
                <span className="font-black text-base text-[#0866D9] font-mono">
                  {confirmedOrder.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Client Name:</span>
                <span className="font-bold text-[#071C55]">{confirmedOrder.customer.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Services Ordered:</span>
                <span className="font-bold text-[#071C55]">
                  {confirmedOrder.items.map((i) => `${i.serviceName} (${i.packageName})`).join(", ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Total Amount:</span>
                <span className="font-black text-base text-[#071C55]">{formatINR(confirmedOrder.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Status:</span>
                <span className="rounded-full bg-blue-100 px-3 py-0.5 font-bold text-[#0866D9]">
                  {confirmedOrder.status}
                </span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0866D9] px-7 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#071C55] transition-colors"
              >
                Track This Order Live <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/account"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3.5 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
              >
                View Customer Dashboard
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-[#667085]">
              Need immediate updates? WhatsApp our direct project lead:{" "}
              <a
                href={`https://wa.me/919618890557?text=Hi%20WebCraftly,%20I%20just%20placed%20order%20${confirmedOrder.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0866D9] font-bold hover:underline"
              >
                +91 96188 90557
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  FileText,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatINR,
  type Order,
} from "@/lib/webcraftly";

export const Route = createFileRoute("/orders/")({
  component: OrderTrackingPage,
});

const statusSteps = [
  "Pending Confirmation",
  "Confirmed",
  "In Progress",
  "Under Review",
  "Completed",
];

function getStatusStepIndex(status: string): number {
  if (status === "Cancelled") return -1;
  const normalized = status === "Pending" ? "Pending Confirmation" : status;
  const idx = statusSteps.indexOf(normalized);
  return idx >= 0 ? idx : 0;
}

export function OrderTrackingPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch live orders from Neon PostgreSQL
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.orders && data.orders.length > 0) {
          setOrders(data.orders);
          setSelectedOrder(data.orders[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // First check in loaded list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const localMatch = orders.find((o: any) =>
      o.id.toLowerCase() === query.toLowerCase() ||
      (o.customerEmail && o.customerEmail.toLowerCase() === query.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(query))
    );

    if (localMatch) {
      setSelectedOrder(localMatch);
      toast.success(`Found order: ${localMatch.id}`);
      return;
    }

    // Otherwise, fetch directly from Neon via /api/orders/:id
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.order) {
          setSelectedOrder(data.order);
          toast.success(`Found order: ${data.order.id}`);
          return;
        }
      }
      toast.error(`Order '${query}' was not found. Please verify your reference ID.`);
    } catch {
      toast.error("Failed to query order. Please check your reference ID.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = selectedOrder ? getStatusStepIndex(selectedOrder.status) : 0;

  return (
    <div className="min-h-screen bg-[#F4F8FC]/50 py-12 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="brand-pill">Client Order Tracking</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
            Real-Time Project Milestone Tracking
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            Check the live development status and delivery schedule of your purchased WebCraftly services.
          </p>

          {/* Search by Order ID Form */}
          <form onSubmit={handleSearch} className="mt-6 flex max-w-md mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. WC-2026-XXXXX)..."
                className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-[#071C55] placeholder-[#667085] focus:border-[#0866D9] focus:outline-hidden shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-[#0866D9] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#071C55] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Track"}
            </button>
          </form>
        </div>

        {selectedOrder ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-7 sm:p-10 shadow-lg">
            {/* Header: Order ID & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                  Project Order ID
                </span>
                <span className="text-2xl font-black text-[#0866D9] font-mono">
                  {selectedOrder.id}
                </span>
                <span className="text-xs text-[#667085] block mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  {selectedOrder.customerName && ` • Client: ${selectedOrder.customerName}`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide ${
                    selectedOrder.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : selectedOrder.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-[#EAF5FF] text-[#0866D9]"
                  }`}
                >
                  ● {selectedOrder.status}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    selectedOrder.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedOrder.paymentStatus || "Awaiting Payment"}
                </span>
                <a
                  href={`https://wa.me/919618805557?text=Hi%20WebCraftly,%20checking%20status%20for%20order%20${selectedOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-50 px-4 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors"
                >
                  <MessageSquare className="size-3.5" /> Project PM WhatsApp
                </a>
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <div className="py-10">
              <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block mb-6">
                Milestone Progress Timeline
              </span>
              <div className="relative">
                {/* Connecting bar */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-0 hidden sm:block" />
                <div
                  className="absolute top-4 left-0 h-1 bg-[#0866D9] -z-0 hidden sm:block transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                  {statusSteps.map((s, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <div key={s} className="flex flex-col items-center text-center">
                        <div
                          className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                            isDone
                              ? "bg-[#0866D9] border-[#0866D9] text-white shadow-md shadow-blue-500/20"
                              : "bg-white border-gray-300 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-[#0866D9]/20" : ""}`}
                        >
                          {isDone ? <CheckCircle2 className="size-4" /> : idx + 1}
                        </div>
                        <span
                          className={`mt-2 text-xs font-bold ${
                            isCurrent ? "text-[#0866D9]" : isDone ? "text-[#071C55]" : "text-[#667085]"
                          }`}
                        >
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Service & Items Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              {/* Left: Purchased Services */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#071C55] uppercase tracking-wider block">
                  Services Included in This Order
                </span>
                {selectedOrder.items &&
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  selectedOrder.items.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-[#071C55]">
                          {item.serviceName}
                        </h4>
                        <span className="font-bold text-[#0866D9]">{item.packageName} Tier</span>
                      </div>
                      <span className="text-[#667085] mt-1 block">
                        Total: {formatINR(item.totalPrice)}
                      </span>
                      {item.addOns && item.addOns.length > 0 && (
                        <div className="mt-2 text-[11px] text-[#667085]">
                          Add-ons: {item.addOns.map((a: { name: string }) => a.name).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Right: Client Requirements Brief */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#071C55] uppercase tracking-wider block">
                  Project Brief & Specifications
                </span>
                <div className="rounded-2xl border border-gray-100 bg-[#F4F8FC] p-4 text-xs space-y-2.5">
                  <div>
                    <span className="text-[#667085] block font-semibold">Description:</span>
                    <p className="text-[#15233D] mt-0.5 leading-relaxed">
                      {selectedOrder.projectDescription || selectedOrder.requirements?.projectDescription}
                    </p>
                  </div>
                  {selectedOrder.referenceUrl && (
                    <div>
                      <span className="text-[#667085] block font-semibold">Reference Link:</span>
                      <a
                        href={selectedOrder.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0866D9] hover:underline break-all"
                      >
                        {selectedOrder.referenceUrl}
                      </a>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200/60 flex justify-between">
                    <span className="text-[#667085]">Verified Total:</span>
                    <span className="font-bold text-[#071C55]">{formatINR(selectedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Payment Method:</span>
                    <span className="font-semibold text-emerald-700">WhatsApp Assisted Commerce</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center bg-white">
            <h3 className="font-bold text-lg text-[#071C55]">No Orders Found</h3>
            <p className="mt-1 text-xs text-[#667085]">
              Please place an order or search using your valid Order Reference ID.
            </p>
            <Link
              to="/services"
              className="mt-4 inline-flex rounded-full bg-[#0866D9] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#071C55]"
            >
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

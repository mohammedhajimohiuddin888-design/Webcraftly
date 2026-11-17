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
  Sparkles
} from "lucide-react";
import {
  getStoredOrders,
  formatINR,
  type Order,
  type OrderStatus
} from "@/lib/webcraftly";

export const Route = createFileRoute("/orders/")({
  component: OrderTrackingPage,
});

const statusSteps: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Under Review",
  "Completed",
];

function getStatusStepIndex(status: OrderStatus): number {
  if (status === "Cancelled") return -1;
  const idx = statusSteps.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function OrderTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const list = getStoredOrders();
    setOrders(list);
    if (list.length > 0) {
      setSelectedOrder(list[0]);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = orders.find(
      (o) =>
        o.id.toLowerCase() === query ||
        o.customer.email.toLowerCase() === query ||
        o.customer.phone.includes(query)
    );

    if (match) {
      setSelectedOrder(match);
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
                placeholder="Enter Order ID (e.g. WC-2026-84920)..."
                className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-[#071C55] placeholder-[#667085] focus:border-[#0866D9] focus:outline-hidden shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-[#0866D9] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
            >
              Track
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
                </span>
              </div>

              <div className="flex items-center gap-3">
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
                <a
                  href={`https://wa.me/919618890557?text=Hi%20WebCraftly,%20checking%20status%20for%20order%20${selectedOrder.id}`}
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
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
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
                    {item.addOns.length > 0 && (
                      <div className="mt-2 text-[11px] text-[#667085]">
                        Add-ons: {item.addOns.map((a) => a.name).join(", ")}
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
                      {selectedOrder.requirements.projectDescription}
                    </p>
                  </div>
                  {selectedOrder.requirements.referenceUrl && (
                    <div>
                      <span className="text-[#667085] block font-semibold">Reference Link:</span>
                      <a
                        href={selectedOrder.requirements.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0866D9] hover:underline break-all"
                      >
                        {selectedOrder.requirements.referenceUrl}
                      </a>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200/60 flex justify-between">
                    <span className="text-[#667085]">Payment Status:</span>
                    <span className="font-bold text-emerald-600">{selectedOrder.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center bg-white">
            <h3 className="font-bold text-lg text-[#071C55]">No Orders Found</h3>
            <p className="mt-1 text-xs text-[#667085]">
              Please place an order or search using your valid Order ID.
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

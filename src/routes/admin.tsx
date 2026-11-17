import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Package,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Lock,
  Layers,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import {
  services,
  getStoredOrders,
  getStoredInquiries,
  updateOrderStatus,
  formatINR,
  type Order,
  type OrderStatus,
  type CustomQuoteInquiry
} from "@/lib/webcraftly";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Pre-authenticated for convenient evaluation
  const [adminPin, setAdminPin] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "quotes" | "services">("overview");

  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<CustomQuoteInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = () => {
    setOrders(getStoredOrders());
    setInquiries(getStoredInquiries());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("webcraftly-orders-change", refreshData);
    window.addEventListener("webcraftly-inquiries-change", refreshData);
    return () => {
      window.removeEventListener("webcraftly-orders-change", refreshData);
      window.removeEventListener("webcraftly-inquiries-change", refreshData);
    };
  }, []);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    refreshData();
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  // Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending" || o.status === "Confirmed").length;
  const activeProjects = orders.filter((o) => o.status === "In Progress" || o.status === "Under Review").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F8FC]/60 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="brand-pill">Internal Portal</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Admin Mode Active
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-[#071C55] tracking-tight">
              WebCraftly Operations & Order Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
            >
              Public Storefront
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 gap-8 mb-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition-colors ${
              activeTab === "overview"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition-colors ${
              activeTab === "orders"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Orders Management ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`pb-3 transition-colors ${
              activeTab === "quotes"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Custom Quotes & Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-3 transition-colors ${
              activeTab === "services"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Service Catalog ({services.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs">
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="font-black text-3xl text-[#071C55] mt-1 block">
                  {totalOrders}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  All recorded client orders
                </span>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs">
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                  Pending / Confirmed
                </span>
                <span className="font-black text-3xl text-[#0866D9] mt-1 block">
                  {pendingOrders}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                  Awaiting kick-off sprint
                </span>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs">
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                  Active in Sprints
                </span>
                <span className="font-black text-3xl text-amber-600 mt-1 block">
                  {activeProjects}
                </span>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                  In progress & under review
                </span>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs">
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                  Completed Deliveries
                </span>
                <span className="font-black text-3xl text-emerald-600 mt-1 block">
                  {completedOrders}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  Launched to production
                </span>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                  Gross Pipeline Value
                </span>
                <span className="font-black text-2xl text-[#071C55] mt-1 block truncate">
                  {formatINR(totalRevenue)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  Verified customer orders
                </span>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-lg text-[#071C55]">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-[#0866D9] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-[#667085]">
                      <th className="pb-3 font-bold uppercase">Order ID</th>
                      <th className="pb-3 font-bold uppercase">Customer</th>
                      <th className="pb-3 font-bold uppercase">Services</th>
                      <th className="pb-3 font-bold uppercase">Total</th>
                      <th className="pb-3 font-bold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono font-bold text-[#0866D9]">{o.id}</td>
                        <td className="py-3 font-semibold text-[#071C55]">{o.customer.fullName}</td>
                        <td className="py-3 text-[#667085]">
                          {o.items.map((i) => `${i.serviceName} (${i.packageName})`).join(", ")}
                        </td>
                        <td className="py-3 font-bold text-[#071C55]">{formatINR(o.total)}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-[#0866D9]">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders by ID, customer name, or email..."
                className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
              />
            </div>

            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-[#0866D9]">
                          {order.id}
                        </span>
                        <span className="text-xs text-[#667085]">
                          • {order.customer.fullName} ({order.customer.phone})
                        </span>
                      </div>
                      <span className="text-xs text-[#667085] mt-0.5 block">
                        Email: {order.customer.email} {order.customer.businessName && `| Brand: ${order.customer.businessName}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-[#667085] uppercase block">Total</span>
                        <span className="font-black text-base text-[#071C55]">
                          {formatINR(order.total)}
                        </span>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="rounded-xl border border-gray-200 bg-[#F4F8FC] px-3 py-1.5 text-xs font-bold text-[#0866D9] focus:outline-hidden"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Specifications */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[#071C55] uppercase tracking-wider block mb-1">
                        Ordered Services:
                      </span>
                      {order.items.map((i) => (
                        <div key={i.id} className="text-[#15233D] mb-1">
                          • <strong>{i.serviceName}</strong> ({i.packageName}) — {formatINR(i.totalPrice)}
                          {i.addOns.length > 0 && (
                            <span className="text-[#667085] block ml-3">
                              Add-ons: {i.addOns.map((a) => a.name).join(", ")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <span className="font-bold text-[#071C55] uppercase tracking-wider block mb-1">
                        Client Requirements Brief:
                      </span>
                      <p className="text-[#667085] leading-relaxed">
                        {order.requirements.projectDescription}
                      </p>
                      {order.requirements.referenceUrl && (
                        <span className="text-[#0866D9] block mt-1">
                          Ref: {order.requirements.referenceUrl}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM QUOTES */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#0866D9]">{inq.id}</span>
                    <h4 className="font-bold text-base text-[#071C55] mt-0.5">
                      {inq.requiredService}
                    </h4>
                    <span className="text-xs text-[#667085]">
                      From {inq.fullName} ({inq.email} • {inq.phone})
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
                    {inq.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-[#15233D] space-y-2">
                  <p><strong>Brief:</strong> {inq.projectDescription}</p>
                  <div className="flex gap-4 text-[#667085]">
                    <span><strong>Budget:</strong> {inq.budget}</span>
                    <span><strong>Timeline:</strong> {inq.timeline}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <a
                    href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(inq.fullName)},%20regarding%20your%20WebCraftly%20inquiry%20${inq.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#0866D9] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#071C55]"
                  >
                    Reply via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SERVICE CATALOG */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.slug} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-base text-[#071C55]">{s.name}</h4>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#667085] line-clamp-2 mb-4">{s.short}</p>

                <div className="border-t border-gray-100 pt-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Basic:</span>
                    <span className="font-bold">{formatINR(s.packages.Basic.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional:</span>
                    <span className="font-bold text-[#0866D9]">{formatINR(s.packages.Professional.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium:</span>
                    <span className="font-bold">{formatINR(s.packages.Premium.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

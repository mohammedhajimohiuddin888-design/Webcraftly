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
  ChevronDown,
  Plus,
  CreditCard,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  services as fallbackServices,
  getStoredInquiries,
  formatINR,
  type CustomQuoteInquiry,
} from "@/lib/webcraftly";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
});

export function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Admin login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab Navigation
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "customers" | "quotes" | "services">("overview");

  // Neon Database Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [catalogServices, setCatalogServices] = useState<any[]>(fallbackServices);
  const [inquiries, setInquiries] = useState<CustomQuoteInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Record Payment Modal State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activePaymentOrder, setActivePaymentOrder] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("UPI Transfer (GPay / PhonePe)");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const checkAdminAuth = async () => {
    try {
      setAuthLoading(true);
      const res = await fetch("/api/auth/get-session");
      const data = await res.json();
      if (data?.user?.role === "admin") {
        setSessionUser(data.user);
        setIsAdmin(true);
        refreshData();
      } else {
        setSessionUser(data?.user || null);
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshData = async () => {
    // 1. Fetch Orders
    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.orders) setOrders(d.orders);
      })
      .catch(() => {});

    // 2. Fetch Customers
    fetch("/api/admin/customers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.customers) setCustomers(d.customers);
      })
      .catch(() => {});

    // 3. Fetch Catalog
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.services) setCatalogServices(d.services);
      })
      .catch(() => {});

    setInquiries(getStoredInquiries());
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.message || data.error || "Login failed");
      }
      if (data.user.role !== "admin") {
        throw new Error("Access Denied: This account does not possess administrator privileges.");
      }
      toast.success("Administrator session verified!");
      setLoginPassword("");
      checkAdminAuth();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to log in as administrator.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Order ${orderId} status updated to '${newStatus}'`);
      refreshData();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleConfirmProject = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Explicitly confirmed via Admin Operations Panel" }),
      });
      if (!res.ok) throw new Error("Failed to confirm project");
      toast.success(`Project ${orderId} explicitly confirmed!`);
      refreshData();
    } catch {
      toast.error("Failed to confirm project.");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentOrder) return;
    const amountNum = parseInt(payAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid positive payment amount.");
      return;
    }

    setIsRecordingPayment(true);
    try {
      const res = await fetch(`/api/admin/orders/${activePaymentOrder.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod: payMethod,
          paymentReference: payRef.trim() || undefined,
          notes: payNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      toast.success(`Payment of ₹${amountNum.toLocaleString("en-IN")} recorded in append-only ledger!`, {
        description: `Order status: ${data.order?.paymentStatus}. Remaining: ₹${data.remainingBalance}`,
      });

      setActivePaymentOrder(null);
      setPayAmount("");
      setPayRef("");
      setPayNotes("");
      refreshData();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to record payment.");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F8FC]/50 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-purple-700 border-t-transparent" />
          <p className="text-xs font-semibold text-[#667085]">Checking administrator authorization...</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW A: NOT LOGGED IN AS ADMIN -> RENDER ADMIN LOGIN
  // ==========================================================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F4F8FC]/60 py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
              Admin Access Protected
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-[#071C55] tracking-tight">
              WebCraftly Control Center
            </h1>
            <p className="mt-2 text-xs text-[#667085]">
              Please authenticate with your administrator credentials to access orders and the financial ledger.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@webcraftly.com"
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-purple-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-purple-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 rounded-full bg-purple-700 py-3 text-xs font-bold text-white shadow-md hover:bg-purple-800 transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? "Authenticating..." : "Unlock Admin Dashboard"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-[11px] text-[#667085]">
              Need to promote your account? Run CLI tool:{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-purple-700 font-mono">
                npm run admin:promote &lt;email&gt;
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW B: AUTHENTICATED ADMINISTRATOR DASHBOARD
  // ==========================================================================

  // Metrics
  const totalOrders = orders.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingOrders = orders.filter((o: any) => o.status === "Pending Confirmation" || o.status === "Confirmed").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeProjects = orders.filter((o: any) => o.status === "In Progress" || o.status === "Under Review").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedOrders = orders.filter((o: any) => o.status === "Completed").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredOrders = orders.filter((o: any) => {
    const q = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q))
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredCustomers = customers.filter((c: any) => {
    const q = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.normalizedEmail.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.businessName && c.businessName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F8FC]/60 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="brand-pill">Internal Portal</span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                Admin: {sessionUser?.name || "Operations Lead"}
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
            <Link
              to="/account"
              className="rounded-full bg-[#0866D9] px-4 py-2 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
            >
              My Account
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 gap-6 sm:gap-8 mb-8 text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "overview"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "orders"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Orders Management ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "customers"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "quotes"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "services"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Catalog ({catalogServices.length})
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
                  Neon PostgreSQL orders
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
                      <th className="pb-3 font-bold uppercase">Payment Status</th>
                      <th className="pb-3 font-bold uppercase">Total</th>
                      <th className="pb-3 font-bold uppercase">Order Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {orders.slice(0, 5).map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono font-bold text-[#0866D9]">{o.id}</td>
                        <td className="py-3 font-semibold text-[#071C55]">{o.customerName || o.customer?.fullName}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700">
                            {o.paymentStatus || "Awaiting Payment"}
                          </span>
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
                placeholder="Search orders by ID, customer name, email, or phone..."
                className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
              />
            </div>

            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs hover:border-[#0866D9]/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-[#0866D9]">
                          {order.id}
                        </span>
                        <span className="text-xs text-[#667085]">
                          • {order.customerName} ({order.customerPhone})
                        </span>
                      </div>
                      <span className="text-xs text-[#667085] mt-0.5 block">
                        Email: {order.customerEmail} {order.customerBusinessName && `| Brand: ${order.customerBusinessName}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-[#667085] uppercase block">Total</span>
                        <span className="font-black text-base text-[#071C55]">
                          {formatINR(order.total)}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          order.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus || "Awaiting Payment"}
                      </span>

                      {/* Status Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="rounded-xl border border-gray-200 bg-[#F4F8FC] px-3 py-1.5 text-xs font-bold text-[#0866D9] focus:outline-hidden"
                      >
                        <option value="Pending Confirmation">Pending Confirmation</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {/* Explicit Project Confirmation Button */}
                      {order.status !== "Confirmed" && (
                        <button
                          onClick={() => handleConfirmProject(order.id)}
                          className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          Confirm Project
                        </button>
                      )}

                      {/* Record Manual Payment Button */}
                      <button
                        onClick={() => {
                          setActivePaymentOrder(order);
                          setPayAmount("");
                        }}
                        className="flex items-center gap-1 rounded-xl bg-[#0866D9] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
                      >
                        <DollarSign className="size-3.5" /> Record Payment
                      </button>
                    </div>
                  </div>

                  {/* Order Specifications */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[#071C55] uppercase tracking-wider block mb-1">
                        Ordered Services:
                      </span>
                      {order.items &&
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        order.items.map((i: any, idx: number) => (
                          <div key={i.id || idx} className="text-[#15233D] mb-1">
                            • <strong>{i.serviceName}</strong> ({i.packageName} Tier) — {formatINR(i.totalPrice)}
                            {i.addOns && i.addOns.length > 0 && (
                              <span className="text-[#667085] block ml-3">
                                Add-ons: {i.addOns.map((a: { name: string }) => a.name).join(", ")}
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
                        {order.projectDescription}
                      </p>
                      {order.referenceUrl && (
                        <span className="text-[#0866D9] block mt-1">
                          Ref: {order.referenceUrl}
                        </span>
                      )}
                      <div className="mt-2 text-[#667085]">
                        <strong>Timeline:</strong> {order.deliveryTimeline}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS MANAGEMENT */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers by name, email, phone, or brand..."
                className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
              />
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[#667085]">
                    <th className="pb-3 font-bold uppercase">Customer</th>
                    <th className="pb-3 font-bold uppercase">Contact</th>
                    <th className="pb-3 font-bold uppercase">Account Type</th>
                    <th className="pb-3 font-bold uppercase">Orders</th>
                    <th className="pb-3 font-bold uppercase">Verified Spend</th>
                    <th className="pb-3 font-bold uppercase">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {filteredCustomers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="py-3">
                        <span className="font-bold text-[#071C55] block">{c.name}</span>
                        {c.businessName && <span className="text-[11px] text-[#667085] block">{c.businessName}</span>}
                      </td>
                      <td className="py-3">
                        <span className="block text-[#071C55]">{c.normalizedEmail}</span>
                        <span className="block text-[#667085]">{c.phone}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            c.isVerifiedAccount
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {c.isVerifiedAccount ? "Verified Account" : "Guest Customer"}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[#071C55]">{c.totalOrders}</td>
                      <td className="py-3 font-bold text-emerald-700">{formatINR(c.totalSpent || 0)}</td>
                      <td className="py-3 font-bold text-[#071C55]">{formatINR(c.outstandingBalance || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM QUOTES */}
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

        {/* TAB 5: SERVICE CATALOG */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {catalogServices.map((s: any) => (
              <div key={s.slug} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-base text-[#071C55]">{s.name}</h4>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    Neon DB
                  </span>
                </div>
                <p className="text-xs text-[#667085] line-clamp-2 mb-4">{s.short || s.shortDescription}</p>

                <div className="border-t border-gray-100 pt-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Starting Price:</span>
                    <span className="font-bold text-[#0866D9]">{formatINR(s.startingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packages:</span>
                    <span className="font-semibold text-[#071C55]">{Object.keys(s.packages || {}).join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: RECORD MANUAL PAYMENT */}
        {activePaymentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-7 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    Append-Only Payment Ledger
                  </span>
                  <h3 className="font-extrabold text-lg text-[#071C55]">
                    Record Verified Manual Payment
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePaymentOrder(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 rounded-2xl bg-[#F4F8FC] p-4 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Order Reference:</span>
                  <span className="font-bold text-[#071C55]">{activePaymentOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Client:</span>
                  <span className="font-bold text-[#071C55]">{activePaymentOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Total Order Value:</span>
                  <span className="font-black text-[#0866D9]">{formatINR(activePaymentOrder.total)}</span>
                </div>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                    Payment Amount (in INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] font-semibold focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  >
                    <option value="UPI Transfer (GPay / PhonePe / Paytm)">UPI Transfer (GPay / PhonePe / Paytm)</option>
                    <option value="Bank IMPS / NEFT / RTGS">Bank IMPS / NEFT / RTGS</option>
                    <option value="Direct Bank Wire Transfer">Direct Bank Wire Transfer</option>
                    <option value="Cash / Cheque Deposit">Cash / Cheque Deposit</option>
                    <option value="Other Verified Transfer">Other Verified Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                    Transaction Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. UTR49281902482"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                    Internal Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Verified 50% advance token credit in ICICI Current Account."
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePaymentOrder(null)}
                    className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-[#667085] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecordingPayment}
                    className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isRecordingPayment ? "Recording..." : "Verify & Save to Ledger"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

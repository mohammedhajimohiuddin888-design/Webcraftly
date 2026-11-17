import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  UserRound,
  Package,
  Clock,
  CheckCircle2,
  Settings,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Mail,
  Phone,
  Building,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredOrders,
  getStoredInquiries,
  formatINR,
  type Order,
  type CustomQuoteInquiry
} from "@/lib/webcraftly";

export const Route = createFileRoute("/account")({
  component: CustomerAccountPage,
});

function CustomerAccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "quotes" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<CustomQuoteInquiry[]>([]);

  // Simple customer profile state
  const [userName, setUserName] = useState("Vikramaditya Rao");
  const [userEmail, setUserEmail] = useState("vikram@apexlaw.in");
  const [userPhone, setUserPhone] = useState("+91 96188 90557");
  const [userCompany, setUserCompany] = useState("Apex Legal Partners");

  useEffect(() => {
    setOrders(getStoredOrders());
    setInquiries(getStoredInquiries());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile information updated successfully!");
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC]/50 py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* User Welcome Card */}
        <div className="rounded-3xl border border-[#0866D9]/15 bg-white p-6 sm:p-8 shadow-md mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#0866D9] border border-[#0866D9]/20 font-black text-xl">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-2xl text-[#071C55]">{userName}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Verified Client
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">
                {userEmail} • {userCompany}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="rounded-full bg-[#0866D9] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#071C55] transition-colors shadow-xs"
            >
              Order New Service
            </Link>
            <a
              href="https://wa.me/919618890557"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="size-3.5 text-[#0866D9]" /> Support
            </a>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 gap-8 mb-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition-colors relative ${
              activeTab === "orders"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`pb-3 transition-colors relative ${
              activeTab === "quotes"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Custom Quotes ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 transition-colors relative ${
              activeTab === "profile"
                ? "text-[#0866D9] border-b-2 border-[#0866D9]"
                : "text-[#667085] hover:text-[#071C55]"
            }`}
          >
            Account Settings
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Package className="size-10 text-[#667085] mx-auto mb-3" />
                <h3 className="font-bold text-base text-[#071C55]">No orders placed yet</h3>
                <p className="text-xs text-[#667085] mt-1">Browse our services to launch your first project.</p>
                <Link
                  to="/services"
                  className="mt-4 inline-flex rounded-full bg-[#0866D9] px-6 py-2 text-xs font-bold text-white hover:bg-[#071C55]"
                >
                  Explore Marketplace
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-[#0866D9] font-mono">
                          {order.id}
                        </span>
                        <span className="rounded-full bg-[#EAF5FF] px-2.5 py-0.5 text-[10px] font-bold text-[#0866D9]">
                          {order.status}
                        </span>
                      </div>
                      <span className="text-xs text-[#667085] mt-0.5 block">
                        Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-[#667085] block">Order Total</span>
                        <span className="font-black text-xl text-[#071C55]">
                          {formatINR(order.total)}
                        </span>
                      </div>
                      <Link
                        to="/orders"
                        className="rounded-xl border border-[#0866D9]/30 bg-[#EAF5FF] px-4 py-2 text-xs font-bold text-[#0866D9] hover:bg-[#0866D9] hover:text-white transition-colors"
                      >
                        Track Milestone
                      </Link>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="mt-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-[#F4F8FC] p-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#071C55]">{item.serviceName}</span>
                          <span className="text-[#667085] ml-2">({item.packageName} Plan)</span>
                          {item.addOns.length > 0 && (
                            <span className="block text-[11px] text-[#667085]">
                              Add-ons: {item.addOns.map((a) => a.name).join(", ")}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[#071C55]">{formatINR(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: QUOTES */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <FileText className="size-10 text-[#667085] mx-auto mb-3" />
                <h3 className="font-bold text-base text-[#071C55]">No custom inquiries yet</h3>
                <p className="text-xs text-[#667085] mt-1">Have custom needs? Request a quote anytime.</p>
                <Link
                  to="/custom-quote"
                  className="mt-4 inline-flex rounded-full bg-[#0866D9] px-6 py-2 text-xs font-bold text-white hover:bg-[#071C55]"
                >
                  Request Custom Quote
                </Link>
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-black text-sm text-[#0866D9] font-mono">{inq.id}</span>
                      <h4 className="font-bold text-base text-[#071C55] mt-0.5">{inq.requiredService}</h4>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
                      {inq.status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-[#15233D] leading-relaxed">
                    {inq.projectDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#667085] border-t border-gray-100 pt-3">
                    <span><strong>Budget:</strong> {inq.budget}</span>
                    <span><strong>Timeline:</strong> {inq.timeline}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div className="max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xs">
            <h3 className="font-extrabold text-xl text-[#071C55] mb-4">
              Client Profile & Company Details
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={userCompany}
                  onChange={(e) => setUserCompany(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="rounded-full bg-[#0866D9] px-7 py-3 font-bold text-white hover:bg-[#071C55] transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

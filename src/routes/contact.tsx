import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  UserRound,
  ArrowRight,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { saveInquiry, type CustomQuoteInquiry } from "@/lib/webcraftly";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Website Development");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      toast.error("Please fill in all contact fields.");
      return;
    }

    setIsSending(true);

    const inqId = `MSG-${Math.floor(10000 + Math.random() * 90000)}`;
    const inquiry: CustomQuoteInquiry = {
      id: inqId,
      createdAt: new Date().toISOString(),
      fullName: name,
      email,
      phone,
      requiredService: service,
      budget: "Standard Pricing Inquiry",
      timeline: "Standard",
      projectDescription: message,
      status: "New",
    };

    setTimeout(() => {
      saveInquiry(inquiry);
      setIsSending(false);
      setSentSuccess(true);
      toast.success("Message sent! Our team will contact you shortly.");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="bg-mesh-gradient border-b border-[#0866D9]/15 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="brand-pill">Get In Touch</span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-[#071C55] tracking-tight">
              Let's Connect & Build Together
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#667085] leading-relaxed">
              Have a question about our packages or need a custom solution? Reach out directly via WhatsApp, phone, or our online inquiry form.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left 5 Cols: Direct Contact Channels */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[#071C55]">
                  Direct Contact Information
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed">
                  Fastest responses are via WhatsApp. Our client managers are active Monday through Saturday, 9:00 AM to 8:00 PM IST.
                </p>
              </div>

              {/* WhatsApp Primary Card */}
              <a
                href="https://wa.me/919618890557?text=Hi%20WebCraftly,%20I'd%20like%20to%20discuss%20a%20project"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-green-500/30 bg-green-50/50 p-5 transition-transform hover:-translate-y-1 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">
                    <MessageSquare className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                      Primary WhatsApp Channel
                    </span>
                    <h4 className="font-extrabold text-base text-[#071C55]">
                      +91 96188 90557
                    </h4>
                    <span className="text-xs text-[#667085]">Instant project chat & file sharing</span>
                  </div>
                </div>
                <span className="rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white">
                  Chat Now
                </span>
              </a>

              {/* Alternative Numbers */}
              <div className="rounded-2xl border border-gray-200 bg-[#F4F8FC] p-5 space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white text-[#0866D9] shadow-2xs border border-gray-100">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <span className="text-[#667085] block font-semibold">Secondary WhatsApp / Helpline:</span>
                    <span className="font-bold text-sm text-[#071C55]">+91 93467 58686</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white text-[#0866D9] shadow-2xs border border-gray-100">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <span className="text-[#667085] block font-semibold">Direct Call / Inquiries:</span>
                    <span className="font-bold text-sm text-[#071C55]">+91 86397 11792</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white text-[#0866D9] shadow-2xs border border-gray-100">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <span className="text-[#667085] block font-semibold">Official Email:</span>
                    <a
                      href="mailto:webcraftly.official@gmail.com"
                      className="font-bold text-sm text-[#0866D9] hover:underline"
                    >
                      webcraftly.official@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Working Hours & Guarantee */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 text-xs text-[#667085] space-y-2">
                <div className="flex items-center gap-2 text-[#071C55] font-bold">
                  <Clock className="size-4 text-[#0866D9]" />
                  <span>Working Hours</span>
                </div>
                <p>Monday – Saturday: 9:00 AM – 8:00 PM IST</p>
                <p>Sunday: Emergency & VIP Support Only</p>
              </div>

              {/* Quick Portal Access Beside Contact Info */}
              <div className="rounded-2xl border border-[#0866D9]/20 bg-gradient-to-br from-[#EAF5FF] to-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0866D9]">
                    Portal Logins
                  </span>
                  <span className="text-[10px] font-bold text-[#667085]">Instant Access</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/account"
                    className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-white border border-[#0866D9]/15 hover:border-[#0866D9] hover:shadow-xs transition-all group"
                  >
                    <UserRound className="size-5 text-[#0866D9] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-xs text-[#071C55]">Customer Login</span>
                    <span className="text-[9.5px] text-[#667085]">Orders & Quotes</span>
                  </Link>
                  <Link
                    to="/account"
                    className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-purple-50/70 border border-purple-200 hover:border-purple-500 hover:shadow-xs transition-all group"
                  >
                    <ShieldCheck className="size-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-xs text-purple-950">Admin Login</span>
                    <span className="text-[9.5px] text-purple-700 font-semibold truncate max-w-full px-1">mohammed...</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-lg">
                <h3 className="font-extrabold text-2xl text-[#071C55] mb-2">
                  Send a Direct Message
                </h3>
                <p className="text-xs text-[#667085] mb-6">
                  Fill in the details below and we will get back to you within 2 hours.
                </p>

                {sentSuccess ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
                    <CheckCircle2 className="size-12 text-emerald-600 mx-auto mb-3" />
                    <h4 className="font-extrabold text-xl text-[#071C55]">Message Sent!</h4>
                    <p className="mt-1 text-xs text-[#667085]">
                      Thank you for contacting WebCraftly. One of our engineers will reply shortly.
                    </p>
                    <button
                      onClick={() => {
                        setSentSuccess(false);
                        setMessage("");
                      }}
                      className="mt-6 rounded-full bg-[#0866D9] px-6 py-2 text-xs font-bold text-white hover:bg-[#071C55]"
                    >
                      Send Another Note
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. ramesh@example.com"
                          className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 96188 90557"
                          className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Service of Interest
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs font-semibold text-[#071C55] focus:border-[#0866D9] focus:outline-hidden"
                      >
                        <option value="Website Development">Website Development</option>
                        <option value="Content Development">Content Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="E-commerce Solutions">E-commerce Solutions</option>
                        <option value="AI Integration">AI Integration</option>
                        <option value="SEO Optimization">SEO Optimization</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Web Applications">Web Applications</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Message / Project Brief *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help your business grow digitally? Tell us your requirements..."
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSending}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] px-8 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <Send className="size-3.5" />
                        {isSending ? "Sending..." : "Submit Message"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated Section for Admin Login and Customer Login */}
          <div className="mt-16 rounded-3xl border border-[#0866D9]/20 bg-gradient-to-br from-[#F4F8FC] via-white to-[#EAF5FF]/80 p-8 sm:p-12 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0866D9]/15 pb-6">
              <div>
                <span className="brand-pill">Secure Authentication</span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#071C55] tracking-tight">
                  Customer & Administrator Portals
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
                  Need to check your order progress or access the WebCraftly management suite? Choose your portal below for instant authenticated access.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0866D9] shrink-0">
                <Sparkles className="size-4" /> 256-Bit SSL Encrypted
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Login Card */}
              <div className="relative rounded-2xl border border-blue-100 bg-white p-7 shadow-xs hover:border-[#0866D9] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0866D9]/10 text-[#0866D9]">
                      <UserRound className="size-6" />
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-[#0866D9] border border-blue-100">
                      Client Access
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#071C55]">Customer Login</h3>
                  <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                    Access your WebCraftly client dashboard to track ordered packages, submit revisions, inspect deliverables, and manage business profile contact info.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#071C55]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>Live status updates on Website & E-commerce orders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>Direct WhatsApp handoff with reference IDs</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <Link
                    to="/account"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#0866D9] to-[#248BEE] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Sign In to Customer Account</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>

              {/* Admin Login Card */}
              <div className="relative rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-white p-7 shadow-xs hover:border-purple-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
                      <ShieldCheck className="size-6" />
                    </div>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-extrabold text-purple-800 border border-purple-200">
                      Management Only
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#071C55]">Admin Login</h3>
                  <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                    Restricted executive portal for marketplace administration, manual payment approvals, project milestone confirmations, and financial reporting.
                  </p>

                  <div className="mt-4 rounded-xl bg-white border border-purple-200/80 p-3 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                      Designated Administrator Email:
                    </span>
                    <div className="flex items-center gap-2 font-mono font-bold text-xs text-purple-950">
                      <Mail className="size-3.5 text-purple-600 shrink-0" />
                      <span>mohammedhajimohiuddin888@gmail.com</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-purple-100">
                  <Link
                    to="/account"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#071C55] py-3 text-xs font-bold text-white shadow-md hover:bg-purple-950 transition-all"
                  >
                    <Lock className="size-3.5 text-purple-300" />
                    <span>Sign In as Admin (Mohammed)</span>
                    <ArrowRight className="size-4 text-purple-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

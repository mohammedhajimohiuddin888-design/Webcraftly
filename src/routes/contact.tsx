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
  Sparkles
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
        </div>
      </section>
    </div>
  );
}

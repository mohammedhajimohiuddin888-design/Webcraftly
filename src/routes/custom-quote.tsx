import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Send,
  Building,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveInquiry,
  type CustomQuoteInquiry
} from "@/lib/webcraftly";

export const Route = createFileRoute("/custom-quote")({
  component: CustomQuotePage,
});

function CustomQuotePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [requiredService, setRequiredService] = useState("Website Development");
  const [budget, setBudget] = useState("₹25,000 - ₹50,000");
  const [timeline, setTimeline] = useState("Within 2 to 3 weeks");
  const [projectDescription, setProjectDescription] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  const [submittedInquiry, setSubmittedInquiry] = useState<CustomQuoteInquiry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPhoneInvalid =
    phone.trim().length > 0 &&
    (/[a-zA-Z]/.test(phone) || !/^[\d+\s\-()]+$/.test(phone));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !projectDescription.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (isPhoneInvalid || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number containing numbers only (min. 10 digits).");
      return;
    }

    setIsSubmitting(true);
    const inqId = `INQ-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInq: CustomQuoteInquiry = {
      id: inqId,
      createdAt: new Date().toISOString(),
      fullName,
      email,
      phone,
      businessName: businessName || undefined,
      requiredService,
      budget,
      timeline,
      projectDescription,
      referenceUrl: referenceUrl || undefined,
      additionalRequirements: additionalRequirements || undefined,
      status: "New",
    };

    setTimeout(() => {
      saveInquiry(newInq);
      setSubmittedInquiry(newInq);
      setIsSubmitting(false);
      toast.success("Quote request submitted successfully!", {
        description: `Reference Inquiry ID: ${inqId}`,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC]/50 py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {submittedInquiry ? (
          /* Submission Confirmation Card */
          <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-xl">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="size-10" />
            </div>

            <span className="brand-pill mt-6">Inquiry Received</span>
            <h1 className="mt-3 text-3xl font-extrabold text-[#071C55]">
              We Received Your Project Brief!
            </h1>
            <p className="mt-2 text-sm text-[#667085] max-w-lg mx-auto">
              Our lead software architect and technical project manager will analyze your specifications and prepare a formal proposal within 24 hours.
            </p>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-[#F4F8FC] p-6 text-left text-xs space-y-3 max-w-md mx-auto">
              <div className="flex justify-between border-b border-gray-200 pb-2.5">
                <span className="text-[#667085]">Inquiry ID:</span>
                <span className="font-black text-sm text-[#0866D9] font-mono">
                  {submittedInquiry.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Client Name:</span>
                <span className="font-bold text-[#071C55]">{submittedInquiry.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Service Requested:</span>
                <span className="font-bold text-[#071C55]">{submittedInquiry.requiredService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Budget:</span>
                <span className="font-bold text-[#071C55]">{submittedInquiry.budget}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/services"
                className="rounded-full bg-[#0866D9] px-7 py-3 text-xs font-bold text-white hover:bg-[#071C55] transition-colors"
              >
                Browse Standard Packages
              </Link>
              <a
                href={`https://wa.me/919618890557?text=Hi%20WebCraftly,%20I%20just%20submitted%20quote%20request%20${submittedInquiry.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-6 py-3 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="size-4 text-[#0866D9]" /> Direct WhatsApp Follow-up
              </a>
            </div>
          </div>
        ) : (
          /* Custom Quote Request Form */
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="brand-pill">Tailored Solutions</span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
                Request a Custom Project Quote
              </h1>
              <p className="mt-2 text-sm text-[#667085]">
                Have specific technical requirements, custom API integrations, or multi-tenant architectures? Fill out the brief below and get an engineered proposal.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#0866D9] mb-4">
                    1. Contact Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. priya@startup.in"
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Phone Number / WhatsApp *</span>
                        {isPhoneInvalid && (
                          <span className="text-red-600 font-bold text-[11px] normal-case tracking-normal flex items-center gap-1">
                            <AlertCircle className="size-3" /> Numbers only
                          </span>
                        )}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 96188 90557"
                        className={`w-full rounded-xl border p-3 text-xs transition-all focus:outline-hidden ${
                          isPhoneInvalid
                            ? "border-red-500 bg-red-50 text-red-900 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 bg-[#F4F8FC] text-[#071C55] focus:border-[#0866D9] focus:bg-white"
                        }`}
                      />
                      {isPhoneInvalid && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-600">
                          <AlertCircle className="size-3.5 shrink-0" />
                          Invalid phone number: Please enter numbers only (e.g. +91 96188 90557).
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Company or Project Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Acme Tech Solutions"
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Scope & Budget */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#0866D9] mb-4">
                    2. Service & Scope Parameters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Required Service
                      </label>
                      <select
                        value={requiredService}
                        onChange={(e) => setRequiredService(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] font-semibold focus:border-[#0866D9] focus:outline-hidden"
                      >
                        <option value="Website Development">Website Development</option>
                        <option value="Content Development">Content Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="E-commerce Solutions">E-commerce Solutions</option>
                        <option value="AI Integration">AI Integration</option>
                        <option value="SEO Optimization">SEO Optimization</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Web Applications">Web Applications</option>
                        <option value="Multi-Service Combined Solution">Multi-Service Combined Solution</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Estimated Budget (INR)
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] font-semibold focus:border-[#0866D9] focus:outline-hidden"
                      >
                        <option value="Under ₹15,000">Under ₹15,000</option>
                        <option value="₹15,000 - ₹35,000">₹15,000 - ₹35,000</option>
                        <option value="₹35,000 - ₹75,000">₹35,000 - ₹75,000</option>
                        <option value="₹75,000 - ₹1,50,000">₹75,000 - ₹1,50,000</option>
                        <option value="₹1,50,000+ (Enterprise)">₹1,50,000+ (Enterprise)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                        Target Timeline
                      </label>
                      <select
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] font-semibold focus:border-[#0866D9] focus:outline-hidden"
                      >
                        <option value="Urgent (Within 1 week)">Urgent (Within 1 week)</option>
                        <option value="Within 2 to 3 weeks">Within 2 to 3 weeks</option>
                        <option value="1 to 2 Months">1 to 2 Months</option>
                        <option value="Flexible / Ongoing">Flexible / Ongoing</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#0866D9] mb-4">
                    3. Detailed Requirements
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                      Project Description & Objectives *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe what you want to build, key user journeys, any existing software integrations, and target launch criteria..."
                      className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                      Reference Website, Figma File, or Inspiration URL
                    </label>
                    <input
                      type="url"
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      placeholder="https://example.com/spec or figma link"
                      className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-bold text-[#071C55] uppercase tracking-wider mb-1.5">
                      Additional Notes or Special Technical Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                      placeholder="E.g. must comply with HIPAA/GDPR, multi-lingual in Hindi, export to tally..."
                      className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] p-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#667085]">
                    <ShieldCheck className="size-4 text-[#0866D9]" />
                    <span>Your proposal details are kept 100% confidential.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0866D9] to-[#248BEE] px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    <Send className="size-3.5" />
                    {isSubmitting ? "Submitting Brief..." : "Submit Project Brief"}
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

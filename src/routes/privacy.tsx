import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="brand-pill">Legal & Security</span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-[#667085]">
          Last Updated: November 2026 • WebCraftly Digital Solutions
        </p>

        <div className="mt-10 space-y-8 text-xs sm:text-sm text-[#15233D] leading-relaxed border-t border-gray-100 pt-8">
          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">1. Overview</h2>
            <p className="text-[#667085]">
              WebCraftly ("we", "us", "our") respects your privacy and is committed to protecting your personal data and proprietary project brief materials. This policy details how we handle information collected through our service marketplace and customer portals.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">2. Information We Collect</h2>
            <p className="text-[#667085]">
              We collect information that you directly provide when ordering services, creating custom quotes, or chatting with our support leads:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#667085]">
              <li>Contact details: Name, email address, phone number, company/brand name.</li>
              <li>Project brief details: Requirements, reference links, uploaded specifications.</li>
              <li>Transaction records: Payment method reference, ordered packages, and invoicing data.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">3. How We Use Your Data</h2>
            <p className="text-[#667085]">
              Your data is solely used to deliver the digital services you purchased, communicate project milestones, generate tax invoices, and offer post-launch technical support. We never sell, rent, or distribute your private specifications or customer details to any third-party marketing brokers.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">4. Payment Processing Security</h2>
            <p className="text-[#667085]">
              Payment details submitted through Razorpay or direct UPI are securely handled following RBI guidelines and PCI-DSS compliance standards. WebCraftly never stores full card numbers or sensitive banking credentials on our web servers.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">5. Contact Our Privacy Officer</h2>
            <p className="text-[#667085]">
              If you have any questions or data removal requests, please email us at <strong>privacy@webcraftly.agency</strong> or message us on WhatsApp at <strong>+91 96188 90557</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

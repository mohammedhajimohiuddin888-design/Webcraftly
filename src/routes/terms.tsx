import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="brand-pill">Client Agreement</span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#071C55] tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="mt-2 text-xs text-[#667085]">
          Last Updated: November 2026 • WebCraftly Digital Agency & Service Marketplace
        </p>

        <div className="mt-10 space-y-8 text-xs sm:text-sm text-[#15233D] leading-relaxed border-t border-gray-100 pt-8">
          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">1. Scope of Agreement</h2>
            <p className="text-[#667085]">
              By selecting a package, adding services to your cart, or submitting a custom quote on WebCraftly, you enter into a binding agreement with WebCraftly for the provision of professional digital services as detailed in the selected service tier.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">2. Package Deliverables & Turnaround</h2>
            <p className="text-[#667085]">
              Delivery days specified on each package (e.g. 5 days for Basic Starter, 10 days for Professional, 18 days for Web Applications) begin once complete project requirements, assets, and branding guidelines are delivered by the client. Delays in client feedback automatically extend milestone deadlines accordingly.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">3. Revisions & Acceptance Policy</h2>
            <p className="text-[#667085]">
              Each package includes a clearly specified number of revision rounds (e.g. 3 rounds for Basic, 6 for Professional, Unlimited for Premium). Revisions cover adjustments within the agreed original scope. Requests for structural additions outside the initial package will be quoted as optional add-ons.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">4. Code & Intellectual Property Ownership</h2>
            <p className="text-[#667085]">
              Upon full settlement of the project balance, 100% intellectual property rights, source code files, design systems, and database schemas are transferred to the client. WebCraftly retains the right to showcase the completed work in its marketing portfolio unless a Non-Disclosure Agreement (NDA) has been formally executed.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#071C55] mb-2">5. Warranty & Post-Launch Support</h2>
            <p className="text-[#667085]">
              All packages include complimentary bug-fix warranty periods (from 14 to 90 days depending on tier). Ongoing maintenance, monthly backups, and feature enhancements are available through our annual maintenance add-ons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

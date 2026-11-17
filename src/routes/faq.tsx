import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { faqList } from "@/lib/webcraftly";

export const Route = createFileRoute("/faq")({
  component: FAQPage,
});

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "General", "Purchasing", "Development", "Payment"];

  const filteredFaqs = faqList.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="bg-mesh-gradient border-b border-[#0866D9]/15 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="brand-pill">Client Knowledge Base</span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-[#071C55] tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#667085] leading-relaxed">
              Find instant answers to questions regarding our service packages, order workflow, deliverables, pricing, and revision guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* Main Accordion Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#0866D9] text-white shadow-xs"
                    : "bg-gray-100 text-[#667085] hover:bg-gray-200 hover:text-[#071C55]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-6 text-left font-bold text-sm sm:text-base text-[#071C55] hover:text-[#0866D9] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="ml-4 text-2xl font-light text-[#0866D9]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#667085] leading-relaxed border-t border-gray-100 bg-[#F4F8FC]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Support Card */}
          <div className="mt-16 rounded-3xl border border-[#0866D9]/20 bg-gradient-to-br from-[#EAF5FF] via-white to-blue-50/50 p-8 text-center shadow-md">
            <h3 className="font-extrabold text-xl text-[#071C55]">
              Still Have a Question?
            </h3>
            <p className="mt-2 text-xs text-[#667085] max-w-md mx-auto">
              Our technical consultants are available directly on WhatsApp to answer any project questions.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href="https://wa.me/919618890557?text=Hi%20WebCraftly,%20I%20have%20a%20question"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#0866D9] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#071C55]"
              >
                <MessageSquare className="size-3.5" /> WhatsApp: +91 96188 90557
              </a>
              <Link
                to="/contact"
                className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold text-[#071C55] hover:bg-gray-50"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
